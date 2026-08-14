import api from './http';
import type {
  CoursesByInstructorItem,
  StudentsByCourseItem,
  TopCourseItem,
} from '../types/report';

export const getCoursesByInstructorReportApi = async (
  instructorId?: string,
): Promise<CoursesByInstructorItem[]> => {
  const response = await api.get<CoursesByInstructorItem[]>('/reports/courses-by-instructor', {
    params: instructorId ? { instructorId } : undefined,
  });
  return response.data;
};

export const getStudentsByCourseReportApi = async (): Promise<StudentsByCourseItem[]> => {
  const response = await api.get<StudentsByCourseItem[]>('/reports/students-by-course');
  return response.data;
};

export const getTopCoursesReportApi = async (limit = 10): Promise<TopCourseItem[]> => {
  const response = await api.get<TopCourseItem[]>('/reports/top-courses', {
    params: { limit },
  });
  return response.data;
};
