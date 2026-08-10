import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navigationBar">
        <div className="navLeft">
          <div className="logoIcon">V</div>
          <span className="brandText">V.I.T.A. Academy</span>
        </div>
        <div className="navCenter">
          <a href="#inicio" className="navLink">Inicio</a>
          <a href="#quienes-somos" className="navLink">Quiénes Somos</a>
          <a href="#cursos" className="navLink">Cursos</a>
          <a href="#features" className="navLink">Metodología</a>
          <a href="#plataforma" className="navLink">Plataforma</a>
        </div>
        <div className="navRight">
          <button className="ghostButton" onClick={handleSignIn}>Sign In</button>
          <button className="primaryButton" onClick={handleGetStarted}>Get Started →</button>
        </div>
      </nav>

      <div className="landingPage">

      {/* Hero Section */}
      <section className="heroSection" id="inicio">
        <div className="heroPill">Precision Engineering for Mastery</div>
        <h1 className="heroHeadline">
          Aprende Ingeniería de Software al <span className="highlight">Máximo Nivel</span>
        </h1>
        <p className="heroSubtitle">
          V.I.T.A. Academy es la plataforma de entrenamiento interactivo donde dominarás frontend, backend, arquitectura de software, DevOps y cloud computing con estándares de industria real.
        </p>
        <div className="ctaGroup">
          <button className="primaryButton">Explorar Programas →</button>
          <button className="secondaryButton">Acceso Alumnos</button>
        </div>
        <div className="heroVisual">
          <div className="heroVisualSlide">
            <div className="heroVisualContentAnimated">
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '1rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '0.5rem' }}>
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Code Editor
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Syntax Highlighting + Autocomplete</div>
            </div>
          </div>
          <div className="heroVisualSlide">
            <div className="heroVisualContentAnimated">
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '1rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '0.5rem' }}>
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
                Live Preview
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Real-time App Preview</div>
            </div>
          </div>
          <div className="heroVisualSlide">
            <div className="heroVisualContentAnimated">
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '1rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '0.5rem' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Test Suite
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>Automated Testing & Results</div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="metricsBanner">
        <div className="metricItem">
          <div className="metricValue">98%</div>
          <div className="metricLabel">Tasa de Empleabilidad</div>
        </div>
        <div className="metricItem">
          <div className="metricValue">12+</div>
          <div className="metricLabel">Semanas por Programa</div>
        </div>
        <div className="metricItem">
          <div className="metricValue">50+</div>
          <div className="metricLabel">Proyectos Reales</div>
        </div>
        <div className="metricItem">
          <div className="metricValue">4.9/5</div>
          <div className="metricLabel">Calificación Estudiantes</div>
        </div>
      </section>

      {/* About Section */}
      <section className="aboutSection" id="quienes-somos">
        <div className="sectionHeader">
          <h2 className="sectionTitle">¿Quiénes Somos?</h2>
          <p className="sectionSubtitle">Construimos la educación técnica del futuro mediante ingeniería de precisión.</p>
        </div>
        <div className="featureGrid">
          <div className="featureCard">
            <div className="featureIcon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <h3 className="featureTitle">Misión Técnica</h3>
            <p className="featureBody">Formar ingenieros con capacidad de resolver problemas reales de arquitectura y código limpio desde el primer día.</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 21 14 11 2"></polygon>
                <polyline points="2 14 12 14 22 14"></polyline>
              </svg>
            </div>
            <h3 className="featureTitle">Aprende Haciendo</h3>
            <p className="featureBody">Sin teoría vacía. Cada módulo incluye laboratorios prácticos, Code Reviews automatizados y despliegues a producción.</p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="featureTitle">Comunidad & Mentores</h3>
            <p className="featureBody">Acceso directo a desarrolladores senior e ingenieros de la industria con feedback en tiempo real.</p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="coursesSection" id="cursos">
        <div className="sectionHeader">
          <h2 className="sectionTitle">Nuestros Programas Académicos</h2>
          <p className="sectionSubtitle">Rutas completas diseñadas para dominar las stack tecnológicas más demandadas.</p>
        </div>
        <div className="coursesGrid">
          <div className="courseCard">
            <span className="courseTag">Development</span>
            <div className="courseMeta">
              <span>12 Semanas</span>
              <span>•</span>
              <span>Avanzado</span>
            </div>
            <h3 className="courseTitle">Full-Stack Web Engineering</h3>
            <p className="courseDescription">Domina React, Node.js y TypeScript construyendo aplicaciones web completas de nivel empresarial.</p>
            <div className="courseTechs">
              <span className="techBadge">React</span>
              <span className="techBadge">Node.js</span>
              <span className="techBadge">TypeScript</span>
            </div>
            <a href="#" className="courseLink">Ver Malla Curricular →</a>
          </div>
          <div className="courseCard">
            <span className="courseTag">Cloud</span>
            <div className="courseMeta">
              <span>8 Semanas</span>
              <span>•</span>
              <span>Intermedio</span>
            </div>
            <h3 className="courseTitle">Cloud & DevOps Infrastructure</h3>
            <p className="courseDescription">Aprende a desplegar y escalar aplicaciones usando Docker, Kubernetes y AWS.</p>
            <div className="courseTechs">
              <span className="techBadge">Docker</span>
              <span className="techBadge">Kubernetes</span>
              <span className="techBadge">AWS</span>
            </div>
            <a href="#" className="courseLink">Ver Malla Curricular →</a>
          </div>
          <div className="courseCard">
            <span className="courseTag">Security</span>
            <div className="courseMeta">
              <span>10 Semanas</span>
              <span>•</span>
              <span>Principiante</span>
            </div>
            <h3 className="courseTitle">Cybersecurity & Secure Coding</h3>
            <p className="courseDescription">Protege aplicaciones y sistemas con prácticas de seguridad OWASP y pentesting.</p>
            <div className="courseTechs">
              <span className="techBadge">OWASP</span>
              <span className="techBadge">PenTesting</span>
            </div>
            <a href="#" className="courseLink">Ver Malla Curricular →</a>
          </div>
          <div className="courseCard">
            <span className="courseTag">Design</span>
            <div className="courseMeta">
              <span>6 Semanas</span>
              <span>•</span>
              <span>Intermedio</span>
            </div>
            <h3 className="courseTitle">UI/UX & Design Systems</h3>
            <p className="courseDescription">Crea interfaces profesionales con Figma, design tokens y Tailwind CSS.</p>
            <div className="courseTechs">
              <span className="techBadge">Figma</span>
              <span className="techBadge">Design Tokens</span>
              <span className="techBadge">Tailwind</span>
            </div>
            <a href="#" className="courseLink">Ver Malla Curricular →</a>
          </div>
          <div className="courseCard">
            <span className="courseTag">Data AI</span>
            <div className="courseMeta">
              <span>14 Semanas</span>
              <span>•</span>
              <span>Avanzado</span>
            </div>
            <h3 className="courseTitle">AI & Machine Learning Operations</h3>
            <p className="courseDescription">Implementa modelos de IA y sistemas MLOps con Python y PyTorch.</p>
            <div className="courseTechs">
              <span className="techBadge">Python</span>
              <span className="techBadge">PyTorch</span>
              <span className="techBadge">MLOps</span>
            </div>
            <a href="#" className="courseLink">Ver Malla Curricular →</a>
          </div>
          <div className="courseCard">
            <span className="courseTag">Backend</span>
            <div className="courseMeta">
              <span>6 Semanas</span>
              <span>•</span>
              <span>Intermedio</span>
            </div>
            <h3 className="courseTitle">Relational Databases & SQL Ops</h3>
            <p className="courseDescription">Domina bases de datos relacionales, optimización SQL y ORMs modernos.</p>
            <div className="courseTechs">
              <span className="techBadge">MySQL</span>
              <span className="techBadge">PostgreSQL</span>
              <span className="techBadge">ORMs</span>
            </div>
            <a href="#" className="courseLink">Ver Malla Curricular →</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="featuresSection" id="features">
        <div className="featureRow">
          <div className="featureText">
            <h2 className="sectionTitle">Code Editor Interactivo & Test Suite en Vivo</h2>
            <p className="sectionSubtitle">Escribe código directamente en el navegador con nuestro editor integrado que incluye syntax highlighting, autocompletado y ejecución en tiempo real.</p>
          </div>
          <div className="featureVisual">
            <div className="featureVisualContent">
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  Browser-based IDE
                </div>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Syntax Highlighting
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 21 14 11 2"></polygon>
                    <polyline points="2 14 12 14 22 14"></polyline>
                  </svg>
                  Real-time Execution
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="featureRow">
          <div className="featureText">
            <h2 className="sectionTitle">Métricas de Rendimiento & Feedback en Tiempo Real</h2>
            <p className="sectionSubtitle">Visualiza tu progreso con dashboards interactivos, gráficos de radar de habilidades y feedback instantáneo de mentores.</p>
          </div>
          <div className="featureVisual">
            <div className="featureVisualContent">
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  Progress Dashboard
                </div>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                  Skill Radar Charts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Real-time Feedback
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonialsSection">
        <div className="sectionHeader">
          <h2 className="sectionTitle">Lo que dicen nuestros estudiantes</h2>
          <p className="sectionSubtitle">Historias de éxito de graduados que ahora trabajan en empresas líderes.</p>
        </div>
        <div className="testimonialsGrid">
          <div className="testimonialCard">
            <div className="testimonialAvatar">MA</div>
            <div className="testimonialName">María Aguilar</div>
            <div className="testimonialRole">Frontend Developer @ Google</div>
            <div className="testimonialRating">⭐⭐⭐⭐⭐</div>
            <p className="testimonialQuote">"V.I.T.A. Academy transformó mi carrera. El enfoque práctico y los proyectos reales me prepararon perfectamente para trabajar en Big Tech."</p>
          </div>
          <div className="testimonialCard">
            <div className="testimonialAvatar">CR</div>
            <div className="testimonialName">Carlos Rodríguez</div>
            <div className="testimonialRole">DevOps Engineer @ Amazon</div>
            <div className="testimonialRating">⭐⭐⭐⭐⭐</div>
            <p className="testimonialQuote">"Los mentores son increíbles. Me guiaron desde cero hasta conseguir mi primer trabajo en cloud computing en menos de 6 meses."</p>
          </div>
          <div className="testimonialCard">
            <div className="testimonialAvatar">LP</div>
            <div className="testimonialName">Laura Pérez</div>
            <div className="testimonialRole">Full Stack Developer @ Microsoft</div>
            <div className="testimonialRating">⭐⭐⭐⭐⭐</div>
            <p className="testimonialQuote">"La calidad del contenido es superior a cualquier bootcamp que he tomado. Los code reviews automatizados marcaron la diferencia."</p>
          </div>
        </div>
      </section>
    </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footerContent">
          <div className="footerTop">
            <div className="footerColumn">
              <h4>Site Map</h4>
              <ul>
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#cursos">Cursos</a></li>
                <li><a href="#quienes-somos">Quiénes Somos</a></li>
                <li><a href="#plataforma">Plataforma</a></li>
              </ul>
            </div>
            <div className="footerColumn">
              <h4>Academic Tracks</h4>
              <ul>
                <li><a href="#">Full-Stack Development</a></li>
                <li><a href="#">Cloud & DevOps</a></li>
                <li><a href="#">Cybersecurity</a></li>
                <li><a href="#">AI & Machine Learning</a></li>
              </ul>
            </div>
            <div className="footerColumn">
              <h4>Legal Terms</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>
            <div className="footerColumn">
              <h4>Newsletter</h4>
              <div className="newsletterInput">
                <input type="email" placeholder="Enter your email" />
                <button className="primaryButton" style={{ padding: '10px 16px' }}>Subscribe</button>
              </div>
            </div>
          </div>
          <div className="footerBottom">
            <div className="footerCopyright">V.I.T.A. Academy - Precision Engineering for Mastery.</div>
            <div className="footerBottomLinks">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security Standards</a>
              <a href="#">Support</a>
            </div>
            <div className="footerCopyright">© 2026 V.I.T.A. Academy. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
};