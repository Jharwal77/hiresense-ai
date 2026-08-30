import api from './api';

const getCompanyPayload = (response) => response?.data?.data?.company ?? response?.data?.company ?? null;

export const getMyCompany = async () => {
  const response = await api.get('/companies/me');
  return getCompanyPayload(response);
};

export const createCompany = async (payload) => {
  const response = await api.post('/companies', payload);
  return getCompanyPayload(response);
};

export const updateMyCompany = async (payload) => {
  const response = await api.patch('/companies/me', payload);
  return getCompanyPayload(response);
};
