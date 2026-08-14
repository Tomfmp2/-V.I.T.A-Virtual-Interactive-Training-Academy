import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCategoriesApi } from '../../api/categoriesApi';
import { getLevelsApi } from '../../api/levelsApi';
import {
  changeCourseStatusApi,
  createCourseApi,
  getCoursesApi,
  getMyCoursesApi,
} from '../../api/coursesApi';
import { createLessonApi, deleteLessonApi, getLessonsApi } from '../../api/lessonsApi';
import { getUsersApi } from '../../api/usersApi';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { isAdminRole, normalizePlatformRole } from '../../utils/coursePermissions';
import type { Category } from '../../types/category';
import type { CourseAdminCreateRequest, CourseCreateRequest, CourseListItem } from '../../types/course';
import type { Level } from '../../types/level';
import type { Lesson, LessonRequest } from '../../types/lesson';
import type { AdminUser } from '../../types/user';
import './DomainShared.css';

export interface ManageCoursesPageProps {
  variant: 'instructor' | 'admin';
}

type CourseFormState = {
  titulo: string;
  descripcionCorta: string;
  idCategoria: string;
  idNivel: string;
  idInstructor: string;
};

const emptyCourseForm: CourseFormState = {
  titulo: '',
  descripcionCorta: '',
  idCategoria: '',
  idNivel: '',
  idInstructor: '',
};

const emptyLessonForm: LessonRequest = {
  titulo: '',
  descripcion: '',
  recurso: '',
  orden: 1,
};

const isInstructorUser = (userItem: AdminUser): boolean =>
  normalizePlatformRole(userItem.rol) === 'instructor';

const normalizeCourseStatus = (estado: string): string => estado.trim().toLowerCase();

export const ManageCoursesPage = ({ variant }: ManageCoursesPageProps) => {
  const { user } = useAuth();
  const platformRole = normalizePlatformRole(user?.rol);
  const isAdminVariant = variant === 'admin';
  const canAccess =
    (isAdminVariant && isAdminRole(user?.rol)) ||
    (variant === 'instructor' && (platformRole === 'instructor' || platformRole === 'admin'));

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [instructors, setInstructors] = useState<AdminUser[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseFormState>(emptyCourseForm);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseSaveError, setCourseSaveError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonRequest>(emptyLessonForm);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [lessonSaveError, setLessonSaveError] = useState('');
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState('');
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const loadCourses = useCallback(async () => {
    if (!canAccess) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const data = isAdminVariant ? await getCoursesApi() : await getMyCoursesApi();
      setCourses(data);
    } catch {
      setLoadError('No se pudieron cargar los cursos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, isAdminVariant]);

  const loadCatalogData = useCallback(async () => {
    if (!canAccess) return;

    try {
      const [categoriesData, levelsData] = await Promise.all([
        getCategoriesApi(),
        getLevelsApi(),
      ]);
      setCategories(categoriesData);
      setLevels(levelsData);

      if (isAdminVariant) {
        const usersData = await getUsersApi();
        setInstructors(usersData.filter(isInstructorUser));
      }
    } catch {
      setLoadError('No se pudieron cargar categorías o niveles.');
    }
  }, [canAccess, isAdminVariant]);

  const loadLessons = useCallback(async (courseId: number) => {
    setIsLoadingLessons(true);
    setLessonsError('');

    try {
      const data = await getLessonsApi(courseId);
      setLessons(data);
    } catch {
      setLessonsError('No se pudieron cargar las lecciones del curso.');
      setLessons([]);
    } finally {
      setIsLoadingLessons(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
    void loadCatalogData();
  }, [loadCourses, loadCatalogData]);

  useEffect(() => {
    if (selectedCourseId == null) {
      setLessons([]);
      return;
    }

    void loadLessons(selectedCourseId);
  }, [selectedCourseId, loadLessons]);

  if (!canAccess) {
    return (
      <section className="domain-page" aria-labelledby="manage-courses-title">
        <h1 id="manage-courses-title">{isAdminVariant ? 'Cursos' : 'Mis clases'}</h1>
        <div className="domain-alert domain-alert-error" role="alert">
          <strong>Acceso no permitido</strong>
          <span>No tienes permisos para realizar esta acción.</span>
        </div>
      </section>
    );
  }

  const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingCourse(true);
    setCourseSaveError('');

    const payload: CourseCreateRequest = {
      titulo: courseForm.titulo.trim(),
      descripcionCorta: courseForm.descripcionCorta.trim() || null,
      idCategoria: Number(courseForm.idCategoria),
      idNivel: Number(courseForm.idNivel),
    };

    try {
      if (isAdminVariant) {
        const adminPayload: CourseAdminCreateRequest = {
          ...payload,
          idInstructor: courseForm.idInstructor.trim(),
        };
        await createCourseApi(adminPayload);
      } else {
        await createCourseApi(payload);
      }

      setFeedback(`Curso "${payload.titulo}" creado en borrador.`);
      setCourseForm(emptyCourseForm);
      setIsCourseFormOpen(false);
      await loadCourses();
    } catch (error) {
      setCourseSaveError(getApiErrorMessage(error, 'No se pudo crear el curso. Intenta de nuevo.'));
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleToggleStatus = async (course: CourseListItem) => {
    const currentStatus = normalizeCourseStatus(course.estado);
    const nextStatus = currentStatus === 'publicado' ? 'borrador' : 'publicado';

    setStatusUpdatingId(course.id);
    setFeedback('');

    try {
      await changeCourseStatusApi(course.id, { estado: nextStatus });
      setFeedback(
        `Curso "${course.titulo}" ${nextStatus === 'publicado' ? 'publicado' : 'movido a borrador'}.`,
      );
      await loadCourses();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'No se pudo cambiar el estado del curso.'));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleLessonSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedCourseId == null) return;

    setIsSavingLesson(true);
    setLessonSaveError('');

    try {
      await createLessonApi(selectedCourseId, {
        titulo: lessonForm.titulo.trim(),
        descripcion: lessonForm.descripcion?.trim() || null,
        recurso: lessonForm.recurso?.trim() || null,
        orden: lessonForm.orden,
      });
      setFeedback(`Lección "${lessonForm.titulo}" creada.`);
      setLessonForm({ ...emptyLessonForm, orden: lessons.length + 1 });
      setIsLessonFormOpen(false);
      await loadLessons(selectedCourseId);
    } catch (error) {
      setLessonSaveError(getApiErrorMessage(error, 'No se pudo crear la lección. Intenta de nuevo.'));
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (selectedCourseId == null) return;

    setDeletingLessonId(lesson.id);
    setFeedback('');

    try {
      await deleteLessonApi(selectedCourseId, lesson.id);
      setFeedback(`Lección "${lesson.titulo}" eliminada.`);
      await loadLessons(selectedCourseId);
    } catch (error) {
      setLessonsError(getApiErrorMessage(error, 'No se pudo eliminar la lección.'));
    } finally {
      setDeletingLessonId(null);
    }
  };

  const pageTitle = isAdminVariant ? 'Cursos' : 'Mis clases';
  const pageDescription = isAdminVariant
    ? 'Crea cursos, asigna instructores y gestiona lecciones.'
    : 'Crea tus cursos, publícalos y administra sus lecciones.';

  return (
    <section className="domain-page" aria-labelledby="manage-courses-title">
      <header className="domain-heading">
        <div>
          <h1 id="manage-courses-title">{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
        <button
          type="button"
          className="domain-btn-primary"
          onClick={() => {
            setIsCourseFormOpen((open) => !open);
            setCourseSaveError('');
          }}
        >
          {isCourseFormOpen ? 'Cerrar formulario' : 'Nuevo curso'}
        </button>
      </header>

      {feedback && (
        <p className="domain-alert domain-alert-success" role="status">
          {feedback}
        </p>
      )}

      {isCourseFormOpen && (
        <form className="domain-form" onSubmit={(event) => void handleCourseSubmit(event)}>
          <h2>Crear curso</h2>

          <label className="domain-field">
            <span>Título</span>
            <input
              type="text"
              required
              value={courseForm.titulo}
              onChange={(event) =>
                setCourseForm((current) => ({ ...current, titulo: event.target.value }))
              }
            />
          </label>

          <label className="domain-field">
            <span>Descripción corta</span>
            <textarea
              rows={3}
              value={courseForm.descripcionCorta}
              onChange={(event) =>
                setCourseForm((current) => ({ ...current, descripcionCorta: event.target.value }))
              }
            />
          </label>

          <div className="domain-form-grid">
            <label className="domain-field">
              <span>Categoría</span>
              <select
                required
                value={courseForm.idCategoria}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, idCategoria: event.target.value }))
                }
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="domain-field">
              <span>Nivel</span>
              <select
                required
                value={courseForm.idNivel}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, idNivel: event.target.value }))
                }
              >
                <option value="">Selecciona un nivel</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isAdminVariant && (
            <>
              <label className="domain-field">
                <span>Instructor (ID de usuario)</span>
                <input
                  type="text"
                  value={courseForm.idInstructor}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, idInstructor: event.target.value }))
                  }
                  placeholder="UUID del instructor"
                />
              </label>

              <label className="domain-field">
                <span>O selecciona instructor</span>
                <select
                  value={courseForm.idInstructor}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, idInstructor: event.target.value }))
                  }
                >
                  <option value="">Selecciona un instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.nombre} {instructor.apellido} ({instructor.email})
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {courseSaveError && (
            <p className="domain-inline-error" role="alert">
              {courseSaveError}
            </p>
          )}

          <div className="domain-form-actions">
            <button
              type="button"
              className="domain-btn-ghost"
              onClick={() => {
                setIsCourseFormOpen(false);
                setCourseSaveError('');
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="domain-btn-primary"
              disabled={
                isSavingCourse ||
                (isAdminVariant && !courseForm.idInstructor.trim())
              }
            >
              {isSavingCourse ? 'Guardando…' : 'Crear curso'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando cursos…
        </p>
      ) : loadError ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="domain-btn-ghost" onClick={() => void loadCourses()}>
            Reintentar
          </button>
        </div>
      ) : courses.length === 0 ? (
        <p className="domain-state">Todavía no hay cursos. Crea el primero.</p>
      ) : (
        <div className="domain-card-grid">
          {courses.map((course) => {
            const isPublished = normalizeCourseStatus(course.estado) === 'publicado';

            return (
              <article
                key={course.id}
                className="domain-card"
                aria-current={selectedCourseId === course.id ? 'true' : undefined}
              >
                <span
                  className={`domain-badge ${isPublished ? 'domain-badge-success' : 'domain-badge-muted'}`}
                >
                  {course.estado}
                </span>
                <h2 className="domain-card-title">{course.titulo}</h2>
                <p className="domain-card-meta">
                  {course.categoriaNombre} · {course.nivelNombre}
                </p>
                <p className="domain-card-meta">Instructor: {course.instructorNombre}</p>

                <div className="domain-card-actions">
                  <button
                    type="button"
                    className="domain-btn-ghost"
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    {selectedCourseId === course.id ? 'Seleccionado' : 'Gestionar lecciones'}
                  </button>
                  <button
                    type="button"
                    className="domain-btn-primary"
                    disabled={statusUpdatingId === course.id}
                    onClick={() => void handleToggleStatus(course)}
                  >
                    {statusUpdatingId === course.id
                      ? 'Actualizando…'
                      : isPublished
                        ? 'Pasar a borrador'
                        : 'Publicar'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <section className="domain-section" aria-labelledby="lessons-section-title">
          <div className="domain-toolbar">
            <div>
              <h2 id="lessons-section-title">Lecciones de {selectedCourse.titulo}</h2>
            </div>
            <button
              type="button"
              className="domain-btn-primary"
              onClick={() => {
                setIsLessonFormOpen((open) => !open);
                setLessonForm({ ...emptyLessonForm, orden: lessons.length + 1 });
                setLessonSaveError('');
              }}
            >
              {isLessonFormOpen ? 'Cerrar formulario' : 'Nueva lección'}
            </button>
          </div>

          {isLessonFormOpen && (
            <form className="domain-form" onSubmit={(event) => void handleLessonSubmit(event)}>
              <h2>Crear lección</h2>

              <label className="domain-field">
                <span>Título</span>
                <input
                  type="text"
                  required
                  value={lessonForm.titulo}
                  onChange={(event) =>
                    setLessonForm((current) => ({ ...current, titulo: event.target.value }))
                  }
                />
              </label>

              <div className="domain-form-grid">
                <label className="domain-field">
                  <span>Orden</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={lessonForm.orden}
                    onChange={(event) =>
                      setLessonForm((current) => ({
                        ...current,
                        orden: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className="domain-field">
                  <span>Recurso</span>
                  <input
                    type="text"
                    value={lessonForm.recurso ?? ''}
                    onChange={(event) =>
                      setLessonForm((current) => ({ ...current, recurso: event.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="domain-field">
                <span>Descripción</span>
                <textarea
                  rows={3}
                  value={lessonForm.descripcion ?? ''}
                  onChange={(event) =>
                    setLessonForm((current) => ({ ...current, descripcion: event.target.value }))
                  }
                />
              </label>

              {lessonSaveError && (
                <p className="domain-inline-error" role="alert">
                  {lessonSaveError}
                </p>
              )}

              <div className="domain-form-actions">
                <button
                  type="button"
                  className="domain-btn-ghost"
                  onClick={() => {
                    setIsLessonFormOpen(false);
                    setLessonSaveError('');
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="domain-btn-primary" disabled={isSavingLesson}>
                  {isSavingLesson ? 'Guardando…' : 'Crear lección'}
                </button>
              </div>
            </form>
          )}

          {isLoadingLessons ? (
            <p className="domain-state" role="status">
              Cargando lecciones…
            </p>
          ) : lessonsError ? (
            <div className="domain-alert domain-alert-error" role="alert">
              <span>{lessonsError}</span>
              <button
                type="button"
                className="domain-btn-ghost"
                onClick={() => selectedCourseId && void loadLessons(selectedCourseId)}
              >
                Reintentar
              </button>
            </div>
          ) : lessons.length === 0 ? (
            <p className="domain-state">Este curso aún no tiene lecciones.</p>
          ) : (
            <div className="domain-table-wrapper">
              <table className="domain-table">
                <thead>
                  <tr>
                    <th scope="col">Orden</th>
                    <th scope="col">Título</th>
                    <th scope="col">Recurso</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>{lesson.orden}</td>
                      <td>{lesson.titulo}</td>
                      <td>{lesson.recurso || '—'}</td>
                      <td>
                        <div className="domain-row-actions">
                          <button
                            type="button"
                            className="domain-btn-danger"
                            disabled={deletingLessonId === lesson.id}
                            onClick={() => void handleDeleteLesson(lesson)}
                          >
                            {deletingLessonId === lesson.id ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  );
};
