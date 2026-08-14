import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCourseByIdApi } from '../../api/coursesApi';
import { getLessonsApi } from '../../api/lessonsApi';
import { useAuth } from '../../context/useAuth';
import { matchesTextSearch } from '../../utils/courseSearch';
import {
  getCompletedLessonIds,
  markLessonCompleted,
} from '../../utils/lessonProgress';
import type { Course } from '../../types/course';
import type { Lesson } from '../../types/lesson';
import './CoursePlayerView.css';

export type CoursePlayerViewProps = {
  courseId: number;
  fallbackTitle?: string;
  backLabel?: string;
  onBack: () => void;
};

type ResourceKind = 'youtube' | 'vimeo' | 'video-file' | 'image' | 'link';

const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|#|$)/i;
const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i;

const classifyResource = (rawUrl: string): { kind: ResourceKind; embedUrl: string } => {
  const url = rawUrl.trim();

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id) {
        return {
          kind: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${id}`,
        };
      }
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = parsed.searchParams.get('v');
      const parts = parsed.pathname.split('/').filter(Boolean);
      const fromPath =
        parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live'
          ? parts[1]
          : undefined;
      const id = fromQuery || fromPath;
      if (id) {
        return {
          kind: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${id}`,
        };
      }
    }

    if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
      if (id) {
        return {
          kind: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${id}`,
        };
      }
    }
  } catch {
    // URL relativa o inválida: se clasifica por extensión
  }

  if (IMAGE_EXT.test(url)) return { kind: 'image', embedUrl: url };
  if (VIDEO_EXT.test(url)) return { kind: 'video-file', embedUrl: url };
  return { kind: 'link', embedUrl: url };
};

const LessonResourceMedia = ({ url, title }: { url: string; title: string }) => {
  const { kind, embedUrl } = classifyResource(url);

  if (kind === 'youtube' || kind === 'vimeo') {
    return (
      <div className="course-player-embed">
        <iframe
          src={embedUrl}
          title={`Recurso: ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (kind === 'video-file') {
    return (
      <video controls playsInline preload="metadata" src={embedUrl}>
        Tu navegador no soporta video embebido.
      </video>
    );
  }

  if (kind === 'image') {
    return (
      <img
        className="course-player-image"
        src={embedUrl}
        alt={`Recurso de la lección: ${title}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className="course-player-resource-card">
      <p>No se pudo previsualizar este recurso. Ábrelo en una pestaña nueva.</p>
      <a href={embedUrl} target="_blank" rel="noreferrer" className="course-player-resource-link">
        Abrir recurso →
      </a>
    </div>
  );
};

export const CoursePlayerView = ({
  courseId,
  fallbackTitle,
  backLabel = 'Volver a mis cursos',
  onBack,
}: CoursePlayerViewProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [lessonQuery, setLessonQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseByIdApi(courseId),
        getLessonsApi(courseId),
      ]);
      const ordered = [...lessonsData].sort((a, b) => a.orden - b.orden);
      setCourse(courseData);
      setLessons(ordered);
      setCompletedIds(getCompletedLessonIds(userId, courseId));
      setSelectedLessonId((current) => current ?? ordered[0]?.id ?? null);
    } catch {
      setError('No se pudo cargar el curso o sus lecciones.');
      setCourse(null);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredLessons = useMemo(
    () => lessons.filter((lesson) => matchesTextSearch(lesson.titulo, lessonQuery)),
    [lessons, lessonQuery],
  );

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  const progressPercent = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completedIds.length / lessons.length) * 100);
  }, [completedIds.length, lessons.length]);

  const handleCompleteAndContinue = () => {
    if (!selectedLesson) return;
    const nextCompleted = markLessonCompleted(userId, courseId, selectedLesson.id);
    setCompletedIds(nextCompleted);

    const currentIndex = lessons.findIndex((lesson) => lesson.id === selectedLesson.id);
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
    }
  };

  const title = course?.titulo ?? fallbackTitle ?? 'Curso';

  return (
    <section className="course-player" aria-label={`Curso ${title}`}>
      <header className="course-player-topbar">
        <button type="button" className="course-player-back" onClick={onBack}>
          ← {backLabel}
        </button>
        <p className="course-player-brand">VITA Learning Hub</p>
      </header>

      {isLoading ? (
        <p className="course-player-state">Cargando curso…</p>
      ) : error ? (
        <div className="course-player-state course-player-state-error" role="alert">
          <span>{error}</span>
          <button type="button" className="course-player-ghost" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className="course-player-layout">
          <aside className="course-player-sidebar">
            <h1 className="course-player-course-title">{title}</h1>
            {course && (
              <p className="course-player-course-meta">
                {course.categoriaNombre} · {course.nivelNombre}
              </p>
            )}

            <div className="course-player-progress">
              <div className="course-player-progress-label">
                <span>{progressPercent}% completado</span>
                <span>
                  {completedIds.length}/{lessons.length}
                </span>
              </div>
              <div
                className="course-player-progress-track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="course-player-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <label className="course-player-search">
              <span className="course-player-sr">Buscar lección</span>
              <input
                type="search"
                value={lessonQuery}
                onChange={(event) => setLessonQuery(event.target.value)}
                placeholder="Buscar por título de lección"
              />
            </label>

            <ul className="course-player-lesson-list">
              {filteredLessons.length === 0 ? (
                <li className="course-player-empty-lessons">Sin lecciones que coincidan.</li>
              ) : (
                filteredLessons.map((lesson) => {
                  const done = completedIds.includes(lesson.id);
                  const active = lesson.id === selectedLessonId;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        className={`course-player-lesson-item ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
                        onClick={() => setSelectedLessonId(lesson.id)}
                      >
                        <span className="course-player-lesson-mark" aria-hidden="true">
                          {done ? '✓' : lesson.orden}
                        </span>
                        <span className="course-player-lesson-text">
                          <strong>{lesson.titulo}</strong>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>

          <div className="course-player-main">
            {!selectedLesson ? (
              <div className="course-player-empty-main">
                <strong>Selecciona una lección</strong>
                <span>Elige un ítem del menú para ver su contenido.</span>
              </div>
            ) : (
              <>
                <h2 className="course-player-lesson-title">{selectedLesson.titulo}</h2>

                <div className="course-player-media">
                  {selectedLesson.recurso ? (
                    <LessonResourceMedia
                      url={selectedLesson.recurso}
                      title={selectedLesson.titulo}
                    />
                  ) : (
                    <div className="course-player-resource-card is-muted">
                      <p>Esta lección aún no tiene recurso multimedia.</p>
                    </div>
                  )}
                </div>

                <div className="course-player-description-block">
                  <h3 className="course-player-description-label">Descripción</h3>
                  {selectedLesson.descripcion ? (
                    <p className="course-player-description">{selectedLesson.descripcion}</p>
                  ) : (
                    <p className="course-player-description is-muted">
                      Sin descripción adicional para esta lección.
                    </p>
                  )}
                </div>

                <div className="course-player-cta-wrap">
                  <button
                    type="button"
                    className="course-player-cta"
                    onClick={handleCompleteAndContinue}
                  >
                    {completedIds.includes(selectedLesson.id)
                      ? 'Completada · Continuar →'
                      : 'Completar y continuar →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CoursePlayerView;
