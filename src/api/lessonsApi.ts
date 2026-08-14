import api from './http';
import type { Lesson, LessonRequest } from '../types/lesson';

export const getLessonsApi = async (courseId: number): Promise<Lesson[]> => {
  const response = await api.get<Lesson[]>(`/courses/${courseId}/lessons`);
  return response.data;
};

export const getLessonByIdApi = async (courseId: number, id: number): Promise<Lesson> => {
  const response = await api.get<Lesson>(`/courses/${courseId}/lessons/${id}`);
  return response.data;
};

export const createLessonApi = async (courseId: number, payload: LessonRequest): Promise<Lesson> => {
  const response = await api.post<Lesson>(`/courses/${courseId}/lessons`, payload);
  return response.data;
};

export const updateLessonApi = async (
  courseId: number,
  id: number,
  payload: LessonRequest,
): Promise<Lesson> => {
  const response = await api.put<Lesson>(`/courses/${courseId}/lessons/${id}`, payload);
  return response.data;
};

export const deleteLessonApi = async (courseId: number, id: number): Promise<void> => {
  await api.delete(`/courses/${courseId}/lessons/${id}`);
};
