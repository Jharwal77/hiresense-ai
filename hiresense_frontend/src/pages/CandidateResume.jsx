import { useEffect, useRef, useState } from 'react';

import {
  getCandidateProfile,
  retryResumeAnalysis,
  updateCandidateProfile,
  uploadResumeFile
} from '../services/candidateResumeApi';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/rtf',
  'application/odt',
  'application/vnd.oasis.opendocument.text'
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.rtf',
  '.odt'
];

const PROCESSING_STEPS = [
  'Uploading...',
  'Processing resume...',
  'Extracting information...',
  'Analyzing with AI...'
];

const formatFileSize = (size) => {
  if (!Number.isFinite(size) || size <= 0) {
    return '0 KB';
  }

  const units = ['B', 'KB', 'MB', 'GB'];

  let value = size;
  let unitIndex = 0;

  while (
    value >= 1024 &&
    unitIndex < units.length - 1
  ) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(
    value >= 10 || unitIndex === 0 ? 0 : 1
  )} ${units[unitIndex]}`;
};

const getFileDisplayName = (file) => {
  if (!file) {
    return 'No file selected';
  }

  return file.name || 'Selected file';
};

const isAllowedFile = (file) => {
  if (!file) {
    return false;
  }

  const extension = file.name?.includes('.')
    ? file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase()
    : '';

  if (ALLOWED_EXTENSIONS.includes(extension)) {
    return true;
  }

  return ALLOWED_TYPES.includes(file.type);
};

const getScoreDisplay = (score) => {
  if (score === null || score === undefined) {
    return 'Resume score is not available yet.';
  }

  const numericValue = Number(score);

  if (!Number.isFinite(numericValue)) {
    return 'Resume score is not available yet.';
  }

  return `${numericValue} / 100`;
};

const createDraftProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    name: profile.name || '',

    skills: Array.isArray(profile.skills)
      ? profile.skills.filter(Boolean)
      : [],

    experienceYears:
      profile.experienceYears ??
      profile.experience_years ??
      '',

    education: Array.isArray(profile.education)
      ? profile.education.map((entry) => ({
          institution:
            entry?.institution || '',
          degree:
            entry?.degree ||
            entry?.field ||
            '',
          startYear:
            entry?.startYear ??
            entry?.start_year ??
            '',
          endYear:
            entry?.endYear ??
            entry?.end_year ??
            ''
        }))
      : [],

    workHistory: Array.isArray(
      profile.workHistory
    )
      ? profile.workHistory.map((entry) => ({
          company:
            entry?.company || '',
          role:
            entry?.role || '',
          startDate:
            entry?.startDate ??
            entry?.start_date ??
            '',
          endDate:
            entry?.endDate ??
            entry?.end_date ??
            '',
          description:
            entry?.description || ''
        }))
      : []
  };
};

export default function CandidateResumePage({
  isDark
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [processingStepIndex, setProcessingStepIndex] =
    useState(0);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [draftProfile, setDraftProfile] =
    useState(null);
  const [isEditingProfile, setIsEditingProfile] =
    useState(false);
  const [isDragging, setIsDragging] =
    useState(false);

  /*
   * Load the existing candidate profile.
   *
   * This effect performs an external API synchronization.
   * It does not synchronously initialize derived state.
   */
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const existingProfile =
          await getCandidateProfile();

        if (!isMounted) {
          return;
        }

        if (existingProfile) {
          setProfile(existingProfile);
          setStatus('success');
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        if (requestError?.response?.status === 404) {
          setStatus('idle');
          return;
        }

        setError(
          requestError?.response?.data?.message ||
            'Unable to load your resume profile right now.'
        );

        setStatus('error');
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Processing animation.
   *
   * The effect only owns the interval.
   * It does not synchronously update state when
   * the effect starts, which removes the
   * react(set-state-in-effect) warning.
   */
  useEffect(() => {
    if (
      status !== 'uploading' &&
      status !== 'processing'
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      setProcessingStepIndex((currentIndex) => {
        if (
          currentIndex >=
          PROCESSING_STEPS.length - 1
        ) {
          return 0;
        }

        return currentIndex + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [status]);

  const getCurrentProcessingStep = () => {
    if (status === 'uploading') {
      return PROCESSING_STEPS[
        Math.min(
          processingStepIndex,
          PROCESSING_STEPS.length - 1
        )
      ];
    }

    if (status === 'processing') {
      return PROCESSING_STEPS[
        Math.max(
          1,
          Math.min(
            processingStepIndex,
            PROCESSING_STEPS.length - 1
          )
        )
      ];
    }

    return PROCESSING_STEPS[0];
  };

  const loadingMessage =
    getCurrentProcessingStep();

  const validateFile = (nextFile) => {
    if (!nextFile) {
      return 'Please choose a resume file.';
    }

    if (!isAllowedFile(nextFile)) {
      return 'Unsupported file type. Please upload PDF, DOC, DOCX, TXT, RTF, or ODT.';
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      return 'Resume file must be smaller than 10 MB.';
    }

    return '';
  };

  const handleFileSelect = (nextFile) => {
    const validationError =
      validateFile(nextFile);

    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setError('');
    setStatus('idle');
    setFile(nextFile);
    setProcessingStepIndex(0);
  };

  const resetUploadState = () => {
    setError('');
    setStatus('idle');
    setFile(null);
    setProcessingStepIndex(0);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setError('');
    setProcessingStepIndex(0);
    setStatus('uploading');

    try {
      const response =
        await uploadResumeFile(file);

      const resume =
        response?.data?.resume ?? null;

      if (!resume) {
        throw new Error(
          'The backend did not return a parsed resume profile.'
        );
      }

      setProfile(resume);
      setDraftProfile(null);
      setIsEditingProfile(false);
      setStatus('success');
      setError('');
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Resume upload failed.';

      setError(message);
      setStatus('error');
    }
  };

  const handleRetryAnalysis = async () => {
    try {
      setError('');
      setProcessingStepIndex(3);
      setStatus('processing');

      const updatedProfile =
        await retryResumeAnalysis();

      setProfile(
        updatedProfile || profile
      );

      setDraftProfile(null);
      setIsEditingProfile(false);
      setStatus('success');
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'AI resume analysis failed.';

      setError(message);
      setStatus('error');
    }
  };

  const handleEditProfile = () => {
    if (isEditingProfile) {
      setIsEditingProfile(false);
      setDraftProfile(null);
      return;
    }

    if (!profile) {
      return;
    }

    setDraftProfile(
      createDraftProfile(profile)
    );

    setIsEditingProfile(true);
    setError('');
  };

  const handleDraftChange = (
    field,
    value
  ) => {
    setDraftProfile((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!draftProfile) {
      return;
    }

    try {
      setError('');

      const payload = {
        name: draftProfile.name,

        skills: Array.isArray(
          draftProfile.skills
        )
          ? draftProfile.skills.filter(Boolean)
          : [],

        experienceYears:
          draftProfile.experienceYears === '' ||
          draftProfile.experienceYears === null ||
          draftProfile.experienceYears ===
            undefined
            ? null
            : Number(
                draftProfile.experienceYears
              ),

        education: Array.isArray(
          draftProfile.education
        )
          ? draftProfile.education.map(
              (entry) => ({
                institution:
                  entry.institution || '',
                degree:
                  entry.degree || '',
                startYear:
                  entry.startYear || null,
                endYear:
                  entry.endYear || null
              })
            )
          : [],

        workHistory: Array.isArray(
          draftProfile.workHistory
        )
          ? draftProfile.workHistory.map(
              (entry) => ({
                company:
                  entry.company || '',
                role:
                  entry.role || '',
                startDate:
                  entry.startDate || null,
                endDate:
                  entry.endDate || null,
                description:
                  entry.description || ''
              })
            )
          : []
      };

      const updatedProfile =
        await updateCandidateProfile(
          payload
        );

      const mergedProfile =
        updatedProfile || {
          ...profile,
          ...payload
        };

      setProfile(mergedProfile);
      setDraftProfile(
        createDraftProfile(mergedProfile)
      );
      setIsEditingProfile(false);
      setStatus('success');
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Unable to update the profile.';

      setError(message);
      setStatus('error');
    }
  };

  const cardClass = isDark
    ? 'border-slate-700 bg-slate-900/80'
    : 'border-slate-200 bg-white';

  const mutedText = isDark
    ? 'text-slate-300'
    : 'text-slate-600';

  const softText = isDark
    ? 'text-slate-400'
    : 'text-slate-500';

  const subHeading = isDark
    ? 'text-sky-300'
    : 'text-sky-700';

  const headingText = isDark
    ? 'text-white'
    : 'text-slate-900';

  const chipBase = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-200'
    : 'border-slate-200 bg-slate-50 text-slate-700';

  const infoCard = isDark
    ? 'border-slate-700 bg-slate-950'
    : 'border-slate-200 bg-white';

  const buttonPrimary = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-200'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  const buttonSecondary = isDark
    ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:border-slate-500'
    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300';

  const scoreValue =
    profile?.resumeScore ??
    profile?.score ??
    null;

  const scoreDisplay =
    getScoreDisplay(scoreValue);

  const skillItems = Array.isArray(
    profile?.skills
  )
    ? profile.skills.filter(Boolean)
    : [];

  const educationItems =
    Array.isArray(profile?.education)
      ? profile.education.filter(Boolean)
      : [];

  const workHistory =
    Array.isArray(profile?.workHistory)
      ? profile.workHistory.filter(Boolean)
      : [];

  /*
   * IMPORTANT:
   * The backend returns:
   *
   * resumeStrengths
   * resumeGaps
   *
   * Do not read profile.strengths or
   * profile.skillGaps here.
   */
  const strengths = Array.isArray(
    profile?.resumeStrengths
  )
    ? profile.resumeStrengths.filter(Boolean)
    : [];

  const skillGaps = Array.isArray(
    profile?.resumeGaps
  )
    ? profile.resumeGaps.filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p
          className={`text-sm uppercase tracking-[0.2em] ${subHeading}`}
        >
          Candidate
        </p>

        <h2
          className={`mt-2 text-3xl font-bold ${headingText}`}
        >
          Resume intelligence
        </h2>
      </div>

      <div
        className={`rounded-3xl border p-5 sm:p-6 ${cardClass}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              className={`text-lg font-semibold ${headingText}`}
            >
              Resume
            </p>

            <p
              className={`mt-1 text-sm ${mutedText}`}
            >
              Upload your resume to build your AI
              profile.
            </p>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-xs ${
              isDark
                ? 'border-slate-700 bg-slate-950 text-slate-300'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            PDF, DOC, DOCX, TXT, RTF, ODT • Max 10 MB
          </div>
        </div>

        <div
          className={`mt-6 rounded-2xl border border-dashed p-6 transition ${
            isDark
              ? 'border-slate-600 bg-slate-950/60'
              : 'border-slate-300 bg-slate-50'
          } ${
            isDragging
              ? isDark
                ? 'border-sky-400 bg-sky-500/5'
                : 'border-sky-400 bg-sky-50'
              : ''
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() =>
            setIsDragging(false)
          }
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);

            const droppedFile =
              event.dataTransfer?.files?.[0];

            if (droppedFile) {
              handleFileSelect(droppedFile);
            }
          }}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                isDark
                  ? 'bg-sky-500/10 text-sky-300'
                  : 'bg-sky-50 text-sky-700'
              }`}
            >
              ⬆
            </div>

            <p
              className={`text-base font-medium ${headingText}`}
            >
              Drop your resume here
            </p>

            <p
              className={`mt-2 text-sm ${mutedText}`}
            >
              or
            </p>

            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              className={`mt-3 rounded-xl px-4 py-2 text-sm font-medium ${buttonSecondary}`}
            >
              Choose file
            </button>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,application/odt,application/vnd.oasis.opendocument.text"
              onChange={(event) => {
                const selectedFile =
                  event.target.files?.[0];

                if (selectedFile) {
                  handleFileSelect(
                    selectedFile
                  );
                }
              }}
            />
          </div>
        </div>

        {file && (
          <div
            className={`mt-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              isDark
                ? 'border-slate-700 bg-slate-950'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div>
              <p
                className={`text-sm font-medium ${headingText}`}
              >
                {getFileDisplayName(file)}
              </p>

              <p
                className={`text-xs ${softText}`}
              >
                {formatFileSize(file.size)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetUploadState}
                className={`rounded-xl px-3 py-2 text-sm ${buttonSecondary}`}
              >
                Remove
              </button>

              <button
                type="button"
                onClick={handleUpload}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${buttonPrimary}`}
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {status === 'uploading' ||
      status === 'processing' ? (
        <div
          className={`rounded-3xl border p-6 ${cardClass}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 animate-pulse rounded-full ${
                  isDark
                    ? 'bg-sky-400'
                    : 'bg-sky-600'
                }`}
              />

              <p
                className={`text-lg font-medium ${headingText}`}
              >
                {loadingMessage}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {PROCESSING_STEPS.map(
                (step) => (
                  <div
                    key={step}
                    className={`rounded-2xl border p-3 text-sm ${
                      step === loadingMessage
                        ? isDark
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                          : 'border-sky-200 bg-sky-50 text-sky-700'
                        : isDark
                          ? 'border-slate-700 bg-slate-950 text-slate-400'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    {step}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : null}

      {error && status === 'error' ? (
        <div
          className={`rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm ${
            isDark
              ? 'text-red-200'
              : 'text-red-700'
          }`}
        >
          {error}
        </div>
      ) : null}

      {status === 'success' &&
      profile ? (
        <div className="space-y-6">
          <div
            className={`rounded-3xl border p-6 ${cardClass}`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p
                  className={`text-sm uppercase tracking-[0.2em] ${softText}`}
                >
                  Candidate profile
                </p>

                <h3
                  className={`mt-2 text-2xl font-bold ${headingText}`}
                >
                  {profile.name ||
                    'Candidate'}
                </h3>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={
                    handleEditProfile
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${buttonSecondary}`}
                >
                  {isEditingProfile
                    ? 'Cancel'
                    : 'Edit profile'}
                </button>

                <button
                  type="button"
                  onClick={
                    handleRetryAnalysis
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${buttonSecondary}`}
                >
                  Refresh AI analysis
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div
                className={`rounded-2xl border p-4 ${infoCard}`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${softText}`}
                >
                  Resume Score
                </p>

                <p
                  className={`mt-3 text-2xl font-semibold ${headingText}`}
                >
                  {scoreDisplay}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${infoCard}`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${softText}`}
                >
                  Skills
                </p>

                <p
                  className={`mt-3 text-2xl font-semibold ${headingText}`}
                >
                  {skillItems.length ||
                    'N/A'}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${infoCard}`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${softText}`}
                >
                  Experience
                </p>

                <p
                  className={`mt-3 text-2xl font-semibold ${headingText}`}
                >
                  {profile.experienceYears !=
                  null
                    ? `${profile.experienceYears} years`
                    : 'Not available'}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${infoCard}`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${softText}`}
                >
                  Profile completeness
                </p>

                <p
                  className={`mt-3 text-2xl font-semibold ${headingText}`}
                >
                  {scoreValue != null
                    ? `${scoreValue} / 100`
                    : 'Unavailable'}
                </p>
              </div>
            </div>
          </div>

          {isEditingProfile &&
          draftProfile ? (
            <div
              className={`rounded-3xl border p-6 ${cardClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  className={`text-xl font-semibold ${headingText}`}
                >
                  Edit parsed profile
                </h3>

                <button
                  type="button"
                  onClick={
                    handleSaveProfile
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${buttonPrimary}`}
                >
                  Save changes
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span
                    className={`text-sm font-medium ${headingText}`}
                  >
                    Name
                  </span>

                  <input
                    value={
                      draftProfile.name
                    }
                    onChange={(event) =>
                      handleDraftChange(
                        'name',
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-sm ${
                      isDark
                        ? 'border-slate-700 bg-slate-950 text-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  />
                </label>

                <label className="space-y-2">
                  <span
                    className={`text-sm font-medium ${headingText}`}
                  >
                    Experience (years)
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      draftProfile.experienceYears ??
                      ''
                    }
                    onChange={(event) =>
                      handleDraftChange(
                        'experienceYears',
                        event.target.value
                      )
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-sm ${
                      isDark
                        ? 'border-slate-700 bg-slate-950 text-slate-100'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2">
                <span
                  className={`text-sm font-medium ${headingText}`}
                >
                  Skills
                </span>

                <textarea
                  value={draftProfile.skills.join(
                    ', '
                  )}
                  onChange={(event) =>
                    handleDraftChange(
                      'skills',
                      event.target.value
                        .split(',')
                        .map(
                          (skill) =>
                            skill.trim()
                        )
                        .filter(Boolean)
                    )
                  }
                  rows="3"
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    isDark
                      ? 'border-slate-700 bg-slate-950 text-slate-100'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                />
              </label>
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div
              className={`rounded-3xl border p-6 ${cardClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3
                  className={`text-xl font-semibold ${headingText}`}
                >
                  Skills
                </h3>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {skillItems.length > 0 ? (
                  skillItems.map(
                    (skill) => (
                      <span
                        key={skill}
                        className={`rounded-full border px-3 py-1.5 text-sm ${chipBase}`}
                      >
                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <span
                    className={`text-sm ${mutedText}`}
                  >
                    No skills extracted yet.
                  </span>
                )}
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 ${cardClass}`}
            >
              <h3
                className={`text-xl font-semibold ${headingText}`}
              >
                Education
              </h3>

              <div className="mt-4 space-y-3">
                {educationItems.length >
                0 ? (
                  educationItems.map(
                    (
                      entry,
                      index
                    ) => (
                      <div
                        key={`${entry.institution}-${index}`}
                        className={`rounded-2xl border p-3 ${
                          isDark
                            ? 'border-slate-700 bg-slate-950'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <p
                          className={`font-medium ${headingText}`}
                        >
                          {entry.degree ||
                            entry.field ||
                            'Education entry'}
                        </p>

                        <p
                          className={`mt-1 text-sm ${mutedText}`}
                        >
                          {entry.institution ||
                            'Institution not specified'}
                        </p>

                        {entry.startYear ||
                        entry.endYear ? (
                          <p
                            className={`mt-1 text-xs ${softText}`}
                          >
                            {entry.startYear ||
                              '—'}{' '}
                            -{' '}
                            {entry.endYear ||
                              'Present'}
                          </p>
                        ) : null}
                      </div>
                    )
                  )
                ) : (
                  <p
                    className={`text-sm ${mutedText}`}
                  >
                    No education entries
                    available.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div
              className={`rounded-3xl border p-6 ${cardClass}`}
            >
              <h3
                className={`text-xl font-semibold ${headingText}`}
              >
                Work history
              </h3>

              <div className="mt-4 space-y-4">
                {workHistory.length >
                0 ? (
                  workHistory.map(
                    (job, index) => (
                      <div
                        key={`${job.company}-${index}`}
                        className={`rounded-2xl border p-4 ${
                          isDark
                            ? 'border-slate-700 bg-slate-950'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p
                            className={`font-semibold ${headingText}`}
                          >
                            {job.company ||
                              'Company not specified'}
                          </p>

                          <span
                            className={`text-xs ${softText}`}
                          >
                            {job.startDate ||
                              '—'}{' '}
                            -{' '}
                            {job.endDate ||
                              'Present'}
                          </span>
                        </div>

                        <p
                          className={`mt-2 text-sm ${mutedText}`}
                        >
                          {job.role ||
                            'Role not specified'}
                        </p>

                        {job.description ? (
                          <p
                            className={`mt-2 text-sm ${mutedText}`}
                          >
                            {job.description}
                          </p>
                        ) : null}
                      </div>
                    )
                  )
                ) : (
                  <p
                    className={`text-sm ${mutedText}`}
                  >
                    No work history extracted.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`rounded-3xl border p-6 ${cardClass}`}
              >
                <h3
                  className={`text-xl font-semibold ${headingText}`}
                >
                  AI insights
                </h3>

                <div className="mt-4 space-y-5">
                  <div>
                    <p
                      className={`mb-2 text-sm font-medium ${headingText}`}
                    >
                      Strengths
                    </p>

                    {strengths.length >
                    0 ? (
                      <ul className="space-y-2">
                        {strengths.map(
                          (item, index) => (
                            <li
                              key={`${item}-${index}`}
                              className={`rounded-xl border px-3 py-2 text-sm ${
                                isDark
                                  ? 'border-slate-700 bg-slate-950 text-slate-200'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                              }`}
                            >
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p
                        className={`text-sm ${mutedText}`}
                      >
                        AI insights are not
                        available yet.
                      </p>
                    )}
                  </div>

                  <div>
                    <p
                      className={`mb-2 text-sm font-medium ${headingText}`}
                    >
                      Skill gaps / areas to improve
                    </p>

                    {skillGaps.length >
                    0 ? (
                      <ul className="space-y-2">
                        {skillGaps.map(
                          (item, index) => (
                            <li
                              key={`${item}-${index}`}
                              className={`rounded-xl border px-3 py-2 text-sm ${
                                isDark
                                  ? 'border-slate-700 bg-slate-950 text-slate-200'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                              }`}
                            >
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p
                        className={`text-sm ${mutedText}`}
                      >
                        No skill gap data is
                        available from the
                        backend yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}