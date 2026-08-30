import api from './api';

const normalizeJobPayload = (job = {}) => {
  const payload = { ...job };

  if (Array.isArray(payload.requiredSkills)) {
    payload.requiredSkills = payload.requiredSkills
      .map((skill) => String(skill).trim())
      .filter(Boolean);
  } else if (typeof payload.requiredSkills === 'string') {
    payload.requiredSkills = payload.requiredSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  if (payload.experienceMin !== undefined && payload.experienceMin !== null && payload.experienceMin !== '') {
    payload.experienceMin = Number(payload.experienceMin);
  }

  if (payload.experienceMax !== undefined && payload.experienceMax !== null && payload.experienceMax !== '') {
    payload.experienceMax = Number(payload.experienceMax);
  }

  if (payload.salaryMin !== undefined && payload.salaryMin !== null && payload.salaryMin !== '') {
    payload.salaryMin = Number(payload.salaryMin);
  }

  if (payload.salaryMax !== undefined && payload.salaryMax !== null && payload.salaryMax !== '') {
    payload.salaryMax = Number(payload.salaryMax);
  }

  return payload;
};

export const getEmployerJobs = async () => {
  const response = await api.get('/jobs/my');
  const jobs = response?.data?.data?.jobs ?? response?.data?.jobs ?? [];

  return Array.isArray(jobs) ? jobs : [];
};

export const getEmployerJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response?.data?.data?.job ?? null;
};

export const createEmployerJob = async (job) => {
  const response = await api.post('/jobs', normalizeJobPayload(job));
  return response?.data?.data?.job ?? null;
};

export const updateEmployerJob = async (jobId, job) => {
  const response = await api.patch(`/jobs/${jobId}`, normalizeJobPayload(job));
  return response?.data?.data?.job ?? null;
};

export const closeEmployerJob = async (jobId) => {
  const response = await api.patch(`/jobs/${jobId}/close`);
  return response?.data?.data?.job ?? null;
};

export const deleteEmployerJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response?.data;
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/applications`);
  return response?.data?.data ?? null;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/applications/${applicationId}/status`, { status });
  return response?.data?.data ?? null;
};
