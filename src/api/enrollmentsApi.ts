import api from './http';
import type { Enrollment, EnrollmentRequest } from '../types/enrollment';

export const enrollApi = async (payload: EnrollmentRequest): Promise<Enrollment> => {
  const response = await api.post<Enrollment>('/enrollments', payload);
  return response.data;
};

export const getMyEnrollmentsApi = async (): Promise<Enrollment[]> => {
  const response = await api.get<Enrollment[]>('/enrollments/me');
  return response.data;
};
