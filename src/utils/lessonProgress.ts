const storageKey = (userId: string, courseId: number) =>
  `vita.lesson-progress.${userId}.${courseId}`;

export const getCompletedLessonIds = (userId: string, courseId: number): number[] => {
  try {
    const raw = localStorage.getItem(storageKey(userId, courseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
};

export const markLessonCompleted = (
  userId: string,
  courseId: number,
  lessonId: number,
): number[] => {
  const current = new Set(getCompletedLessonIds(userId, courseId));
  current.add(lessonId);
  const next = [...current];
  localStorage.setItem(storageKey(userId, courseId), JSON.stringify(next));
  return next;
};

export const isLessonCompleted = (
  userId: string,
  courseId: number,
  lessonId: number,
): boolean => getCompletedLessonIds(userId, courseId).includes(lessonId);
