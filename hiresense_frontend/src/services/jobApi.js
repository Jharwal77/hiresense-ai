import api from './api';

const cleanParams = (params = {}) => {
  const next = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      if (normalized === '') return;
      if (key === 'source' && (normalized === 'all' || normalized.toLowerCase() === 'not specified')) return;
      if (key === 'roleLevel' && (normalized === 'all' || normalized.toLowerCase() === 'not specified')) return;
      if (key === 'employmentType' && (normalized === 'all' || normalized.toLowerCase() === 'not specified')) return;
    }

    if (key === 'page' || key === 'limit' || key === 'minSalary' || key === 'maxSalary' || key === 'minExperience' || key === 'maxExperience') {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue) && numericValue >= 0) {
        next[key] = numericValue;
      }
      return;
    }

    next[key] = value;
  });

  return next;
};

export const getJobs = async (params = {}, signal) => {
  const query = cleanParams({
    ...params,
    limit: params.limit ?? 20,
    page: params.page ?? 1
  });

  const response = await api.get('/jobs', { params: query, signal });

  return {
    jobs: response?.data?.data?.jobs ?? [],
    pagination: response?.data?.data?.pagination ?? {
      page: 1,
      limit: query.limit ?? 20,
      total: 0,
      totalPages: 1
    }
  };
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response?.data?.data?.job ?? null;
};

export const applyToJob = async (id) => {
  const response = await api.post(`/jobs/${id}/apply`);
  return response?.data?.data?.application ?? response?.data ?? null;
};
