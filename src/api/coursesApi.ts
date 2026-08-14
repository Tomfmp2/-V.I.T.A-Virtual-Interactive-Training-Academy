import api from './http';
import type {
  Course,
  CourseAdminCreateRequest,
  CourseCreateRequest,
  CourseListItem,
  CourseStatusRequest,
  CourseUpdateRequest,
} from '../types/course';

export const getCoursesApi = async (): Promise<CourseListItem[]> => {
  const response = await api.get<CourseListItem[]>('/courses');
  return response.data;
};

export const getMyCoursesApi = async (): Promise<CourseListItem[]> => {
  const response = await api.get<CourseListItem[]>('/courses/me');
  return response.data;
};

export const getCourseByIdApi = async (id: number): Promise<Course> => {
  const response = await api.get<Course>(`/courses/${id}`);
  return response.data;
};

export const createCourseApi = async (
  payload: CourseCreateRequest | CourseAdminCreateRequest,
): Promise<Course> => {
  const response = await api.post<Course>('/courses', payload);
  return response.data;
};

export const updateCourseApi = async (id: number, payload: CourseUpdateRequest): Promise<Course> => {
  const response = await api.put<Course>(`/courses/${id}`, payload);
  return response.data;
};

export const changeCourseStatusApi = async (
  id: number,
  payload: CourseStatusRequest,
): Promise<Course> => {
  const response = await api.patch<Course>(`/courses/${id}/status`, payload);
  return response.data;
};

export const deleteCourseApi = async (id: number): Promise<void> => {
  await api.delete(`/courses/${id}`);
};
