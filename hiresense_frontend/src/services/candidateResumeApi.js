import api from './api';

export const getCandidateProfile = async () => {
  const response = await api.get('/candidates/me/profile');
  return response?.data?.data?.profile ?? null;
};

export const uploadResumeFile = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/candidates/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const retryResumeAnalysis = async () => {
  const response = await api.post('/candidates/resume/retry');
  return response?.data?.data?.resume ?? null;
};

export const updateCandidateProfile = async (updates) => {
  const response = await api.patch('/candidates/me/profile', updates);
  return response?.data?.data?.profile ?? null;
};
