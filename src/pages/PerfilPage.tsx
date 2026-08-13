import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import './PerfilPage.css';

type ProfileFields = {
  nombre: string;
  apellido: string;
  telefono: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof ProfileFields, string>>;

const countries = [
  { label: 'Colombia', code: '+57' },
  { label: 'Perú', code: '+51' },
  { label: 'México', code: '+52' },
  { label: 'Argentina', code: '+54' },
  { label: 'Chile', code: '+56' },
  { label: 'Ecuador', code: '+593' },
  { label: 'Venezuela', code: '+58' },
  { label: 'Bolivia', code: '+591' },
  { label: 'Brasil', code: '+55' },
  { label: 'Estados Unidos', code: '+1' },
  { label: 'Canadá', code: '+1' },
  { label: 'España', code: '+34' },
];

type ExtendedUser = {
  apellido?: string;
  telefono?: string;
  phone?: string;
  countryCode?: string;
  codigoPais?: string;
};

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.8" />
    {isVisible && <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
  </svg>
);

export const PerfilPage = () => {
  const { user } = useAuth();
  const profileUser = user as (typeof user & ExtendedUser) | null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveMessage, setSaveMessage] = useState('');
  const [countryCode, setCountryCode] = useState(profileUser?.countryCode ?? profileUser?.codigoPais ?? '+57');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<'currentPassword' | 'newPassword' | 'confirmPassword', boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [fields, setFields] = useState<ProfileFields>({
    nombre: user?.nombre ?? '',
    apellido: profileUser?.apellido ?? '',
    telefono: profileUser?.telefono ?? profileUser?.phone ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setFields((current) => ({
      ...current,
      nombre: user?.nombre ?? '',
      apellido: profileUser?.apellido ?? '',
      telefono: profileUser?.telefono ?? profileUser?.phone ?? '',
    }));
    setCountryCode(profileUser?.countryCode ?? profileUser?.codigoPais ?? '+57');
  }, [user?.nombre, profileUser?.apellido, profileUser?.telefono, profileUser?.phone, profileUser?.countryCode, profileUser?.codigoPais]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const updateField = (field: keyof ProfileFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveMessage('');
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    if (!photo) return;

    setPhotoPreview(URL.createObjectURL(photo));
    setSaveMessage('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const isChangingPassword = Boolean(
      fields.currentPassword || fields.newPassword || fields.confirmPassword,
    );

    if (isChangingPassword) {
      if (!fields.currentPassword) nextErrors.currentPassword = 'Ingresa tu contraseña actual.';
      if (!fields.newPassword) nextErrors.newPassword = 'Ingresa una nueva contraseña.';
      if (!fields.confirmPassword) nextErrors.confirmPassword = 'Confirma tu nueva contraseña.';
      if (fields.newPassword && fields.confirmPassword && fields.newPassword !== fields.confirmPassword) {
        nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaveMessage('Cambios guardados en esta sesión.');
    setFields((current) => ({
      ...current,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const avatarLetter = (fields.nombre.trim() || user?.nombre?.trim() || 'U').charAt(0).toUpperCase();
  const togglePasswordVisibility = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  return (
    <section className="profile-page" aria-labelledby="profile-page-title">
      <header className="profile-heading">
        <h1 id="profile-page-title">Configuración de perfil</h1>
        <p>Administra tu información personal y seguridad de tu cuenta.</p>
      </header>

      <form className="profile-card" onSubmit={handleSubmit} noValidate>
        <section className="profile-photo-section" aria-label="Foto de perfil">
          {photoPreview ? (
            <img className="profile-avatar" src={photoPreview} alt="Vista previa de la foto de perfil" />
          ) : (
            <div className="profile-avatar profile-avatar-fallback" aria-label={`Avatar de ${fields.nombre || 'usuario'}`}>
              {avatarLetter}
            </div>
          )}
          <div>
            <p className="profile-photo-title">Foto de perfil</p>
            <button type="button" className="profile-upload-button" onClick={() => fileInputRef.current?.click()}>
              Subir foto
            </button>
            <input ref={fileInputRef} className="profile-file-input" type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </section>

        <section className="profile-form-section" aria-labelledby="personal-details-title">
          <h2 id="personal-details-title">Detalles personales</h2>
          <div className="profile-fields-grid">
            <label className="profile-field">
              <span>Nombre</span>
              <input value={fields.nombre} onChange={(event) => updateField('nombre', event.target.value)} autoComplete="given-name" />
            </label>
            <label className="profile-field">
              <span>Apellido</span>
              <input value={fields.apellido} onChange={(event) => updateField('apellido', event.target.value)} autoComplete="family-name" />
            </label>
            <label className="profile-field">
              <span>Correo</span>
              <input value={user?.email ?? ''} readOnly aria-readonly="true" />
            </label>
            <label className="profile-field">
              <span>Teléfono</span>
              <div className="profile-phone-input">
                <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} aria-label="Código de país">
                  {countries.map((country) => (
                    <option key={`${country.label}-${country.code}`} value={country.code}>{country.label} {country.code}</option>
                  ))}
                </select>
                <input value={fields.telefono} onChange={(event) => updateField('telefono', event.target.value)} autoComplete="tel" inputMode="tel" placeholder="300 123 4567" />
              </div>
            </label>
          </div>
        </section>

        <section className="profile-form-section profile-security-section" aria-labelledby="password-title">
          <h2 id="password-title">Cambiar contraseña</h2>
          <div className="profile-fields-grid">
            <label className="profile-field profile-field-full">
              <span>Contraseña actual</span>
              <div className="profile-password-input">
                <input type={visiblePasswords.currentPassword ? 'text' : 'password'} value={fields.currentPassword} onChange={(event) => updateField('currentPassword', event.target.value)} autoComplete="current-password" aria-invalid={Boolean(errors.currentPassword)} />
                <button type="button" onClick={() => togglePasswordVisibility('currentPassword')} aria-label={visiblePasswords.currentPassword ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}><EyeIcon isVisible={visiblePasswords.currentPassword} /></button>
              </div>
              {errors.currentPassword && <small className="profile-field-error">{errors.currentPassword}</small>}
            </label>
            <label className="profile-field">
              <span>Nueva contraseña</span>
              <div className="profile-password-input">
                <input type={visiblePasswords.newPassword ? 'text' : 'password'} value={fields.newPassword} onChange={(event) => updateField('newPassword', event.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.newPassword)} />
                <button type="button" onClick={() => togglePasswordVisibility('newPassword')} aria-label={visiblePasswords.newPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}><EyeIcon isVisible={visiblePasswords.newPassword} /></button>
              </div>
              {errors.newPassword && <small className="profile-field-error">{errors.newPassword}</small>}
            </label>
            <label className="profile-field">
              <span>Confirmar contraseña</span>
              <div className="profile-password-input">
                <input type={visiblePasswords.confirmPassword ? 'text' : 'password'} value={fields.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} />
                <button type="button" onClick={() => togglePasswordVisibility('confirmPassword')} aria-label={visiblePasswords.confirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}><EyeIcon isVisible={visiblePasswords.confirmPassword} /></button>
              </div>
              {errors.confirmPassword && <small className="profile-field-error">{errors.confirmPassword}</small>}
            </label>
          </div>
        </section>

        <footer className="profile-actions">
          <div>
            <p>Asegúrate de guardar los cambios antes de salir.</p>
            {saveMessage && <span className="profile-save-message" role="status">{saveMessage}</span>}
          </div>
          <button className="profile-save-button" type="submit">Guardar cambios</button>
        </footer>
      </form>
    </section>
  );
};
