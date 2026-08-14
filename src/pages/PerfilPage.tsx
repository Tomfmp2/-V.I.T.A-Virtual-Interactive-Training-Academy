import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  changePasswordApi,
  getMeApi,
  updateProfileApi,
  uploadProfilePhotoApi,
} from '../api/authApi';
import { useAuth } from '../context/useAuth';
import { getApiErrorMessage } from '../utils/apiErrors';
import { getProfilePhotoUrl } from '../utils/profilePhoto';
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

type CountryOption = {
  id: string;
  label: string;
  code: string;
};

const countries: CountryOption[] = [
  { id: 'co', label: 'Colombia', code: '+57' },
  { id: 'pe', label: 'Perú', code: '+51' },
  { id: 'mx', label: 'México', code: '+52' },
  { id: 'ar', label: 'Argentina', code: '+54' },
  { id: 'cl', label: 'Chile', code: '+56' },
  { id: 'ec', label: 'Ecuador', code: '+593' },
  { id: 've', label: 'Venezuela', code: '+58' },
  { id: 'bo', label: 'Bolivia', code: '+591' },
  { id: 'br', label: 'Brasil', code: '+55' },
  { id: 'us', label: 'Estados Unidos', code: '+1' },
  { id: 'ca', label: 'Canadá', code: '+1' },
  { id: 'es', label: 'España', code: '+34' },
];

const defaultCountryId = 'co';

const findCountryIdByCode = (code?: string | null) => {
  if (!code) return defaultCountryId;
  return countries.find((country) => country.code === code)?.id ?? defaultCountryId;
};

const formatPhoneDisplay = (telefono?: string | null) => {
  if (!telefono) return '';
  const digits = telefono.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits;
};

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.8" />
    {isVisible && <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
  </svg>
);

export const PerfilPage = () => {
  const { user, updateUser, photoVersion } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveMessage, setSaveMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [countryId, setCountryId] = useState(defaultCountryId);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<'currentPassword' | 'newPassword' | 'confirmPassword', boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [fields, setFields] = useState<ProfileFields>({
    nombre: user?.nombre ?? '',
    apellido: user?.apellido ?? '',
    telefono: formatPhoneDisplay(user?.telefono),
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const selectedCountry = countries.find((country) => country.id === countryId) ?? countries[0];

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setLoadError('');

      try {
        const profile = await getMeApi();
        if (cancelled) return;

        updateUser(profile);
        setFields((current) => ({
          ...current,
          nombre: profile.nombre,
          apellido: profile.apellido ?? '',
          telefono: formatPhoneDisplay(profile.telefono),
        }));
        setCountryId(findCountryIdByCode(profile.codigoPais));
      } catch (error) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, 'No se pudo cargar tu perfil.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [updateUser]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const updateField = (field: keyof ProfileFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveMessage('');
    setLoadError('');
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCountryId(event.target.value);
    setSaveMessage('');
    setLoadError('');
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    if (!photo) return;

    if (photoPreview) URL.revokeObjectURL(photoPreview);

    setPendingPhoto(photo);
    setPhotoPreview(URL.createObjectURL(photo));
    setSaveMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const isChangingPassword = Boolean(
      fields.currentPassword || fields.newPassword || fields.confirmPassword,
    );

    if (!fields.nombre.trim()) {
      nextErrors.nombre = 'Ingresa tu nombre.';
    } else if (fields.nombre.trim().length < 3) {
      nextErrors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!fields.apellido.trim()) {
      nextErrors.apellido = 'Ingresa tu apellido.';
    } else if (fields.apellido.trim().length < 3) {
      nextErrors.apellido = 'El apellido debe tener al menos 3 caracteres.';
    }

    if (isChangingPassword) {
      if (!fields.currentPassword) nextErrors.currentPassword = 'Ingresa tu contraseña actual.';
      if (!fields.newPassword) {
        nextErrors.newPassword = 'Ingresa una nueva contraseña.';
      } else if (fields.newPassword.length < 8) {
        nextErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres.';
      }
      if (!fields.confirmPassword) nextErrors.confirmPassword = 'Confirma tu nueva contraseña.';
      if (fields.newPassword && fields.confirmPassword && fields.newPassword !== fields.confirmPassword) {
        nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});
    setSaveMessage('');
    setLoadError('');

    try {
      // La contraseña va primero: si la actual es incorrecta no se aplica
      // ningún otro cambio y el usuario recibe un error concreto.
      if (isChangingPassword) {
        await changePasswordApi({
          'contraseñaActual': fields.currentPassword,
          'nuevaContraseña': fields.newPassword,
          'confirmarContraseña': fields.confirmPassword,
        });
      }

      let fotoUrl = user?.fotoUrl ?? null;

      if (pendingPhoto) {
        const uploaded = await uploadProfilePhotoApi(pendingPhoto);
        fotoUrl = uploaded.fotoUrl;
        if (user) {
          updateUser({ ...user, fotoUrl });
        }
        setPendingPhoto(null);
        if (photoPreview) {
          URL.revokeObjectURL(photoPreview);
          setPhotoPreview(null);
        }
      }

      const telefonoDigits = fields.telefono.replace(/\D/g, '');
      const updated = await updateProfileApi({
        nombre: fields.nombre.trim(),
        apellido: fields.apellido.trim(),
        telefono: telefonoDigits || null,
        codigoPais: telefonoDigits ? selectedCountry.code : null,
      });

      updateUser({ ...updated, fotoUrl: updated.fotoUrl ?? fotoUrl });
      setFields((current) => ({
        ...current,
        nombre: updated.nombre,
        apellido: updated.apellido ?? '',
        telefono: formatPhoneDisplay(updated.telefono),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setCountryId(findCountryIdByCode(updated.codigoPais));
      setSaveMessage(
        isChangingPassword
          ? 'Cambios guardados y contraseña actualizada.'
          : 'Cambios guardados correctamente.',
      );
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'No se pudieron guardar los cambios.'));
    } finally {
      setIsSaving(false);
    }
  };

  const avatarLetter = (fields.nombre.trim() || user?.nombre?.trim() || 'U').charAt(0).toUpperCase();
  const profilePhotoSrc = photoPreview ?? getProfilePhotoUrl(user?.fotoUrl, photoVersion);
  const togglePasswordVisibility = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  return (
    <section className="profile-page" aria-labelledby="profile-page-title">
      <header className="profile-heading">
        <h1 id="profile-page-title">Configuración de perfil</h1>
        <p>Administra tu información personal y seguridad de tu cuenta.</p>
      </header>

      {loadError && (
        <p className="profile-load-error" role="alert">
          {loadError}
        </p>
      )}

      <form className="profile-card" onSubmit={handleSubmit} noValidate>
        <section className="profile-photo-section" aria-label="Foto de perfil">
          {profilePhotoSrc ? (
            <img className="profile-avatar" src={profilePhotoSrc} alt="Foto de perfil" />
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
              <input
                value={fields.nombre}
                onChange={(event) => updateField('nombre', event.target.value)}
                autoComplete="given-name"
                aria-invalid={Boolean(errors.nombre)}
                disabled={isLoadingProfile || isSaving}
              />
              {errors.nombre && <small className="profile-field-error">{errors.nombre}</small>}
            </label>
            <label className="profile-field">
              <span>Apellido</span>
              <input
                value={fields.apellido}
                onChange={(event) => updateField('apellido', event.target.value)}
                autoComplete="family-name"
                aria-invalid={Boolean(errors.apellido)}
                disabled={isLoadingProfile || isSaving}
              />
              {errors.apellido && <small className="profile-field-error">{errors.apellido}</small>}
            </label>
            <label className="profile-field">
              <span>Correo</span>
              <input value={user?.email ?? ''} readOnly aria-readonly="true" />
            </label>
            <label className="profile-field">
              <span>Teléfono</span>
              <div className="profile-phone-input">
                <div className="profile-phone-country">
                  <select
                    value={countryId}
                    onChange={handleCountryChange}
                    aria-label="Código de país"
                    disabled={isLoadingProfile || isSaving}
                  >
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.label} {country.code}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={fields.telefono}
                  onChange={(event) => updateField('telefono', event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="300 123 4567"
                  disabled={isLoadingProfile || isSaving}
                />
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
          <button className="profile-save-button" type="submit" disabled={isLoadingProfile || isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </footer>
      </form>
    </section>
  );
};
