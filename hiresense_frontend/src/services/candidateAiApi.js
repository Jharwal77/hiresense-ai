import api from './api';

const normalizeApplications = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.applications)) {
    return payload.applications;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.applications)) {
    return payload.data.applications;
  }

  return [];
};

export const getCandidateApplications = async () => {
  const response = await api.get('/candidates/me/applications');
  return normalizeApplications(response?.data?.data ?? response?.data ?? []);
};

export const getJobMatch = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/match`);
  return response?.data?.data?.match || null;
};

export const getExistingJobMatch = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/match`);
  return response?.data?.data?.match || null;
};

export const getInterviewQuestions = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/questions`);
  return response?.data?.data?.questions || [];
};
