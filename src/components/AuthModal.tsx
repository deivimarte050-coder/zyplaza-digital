import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Camera,
  Upload
} from 'lucide-react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../services/firestore';
import { uploadImage, readFileAsDataUrl } from '../services/imageUpload';
import { UserProfileData } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfileData) => void;
  initialMode?: 'login' | 'register';
  titleActionReason?: string; // e.g. "para contactar a esta tienda por WhatsApp o Chat"
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  titleActionReason = 'para contactar tiendas, enviar mensajes o publicar artículos'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('San Pedro de Macorís');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMsg('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selecciona una imagen válida en formato JPG, PNG o WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La foto no puede pesar más de 5 MB.');
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    try {
      setAvatarPreview(await readFileAsDataUrl(file));
    } catch {
      setErrorMsg('No se pudo leer la foto. Intenta con otra imagen.');
    }
  };

  const mapAuthError = (error: unknown): string => {
    const code = (error as { code?: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado. Inicia sesión con tus datos.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'El correo o la contraseña no son correctos.';
      case 'auth/invalid-email':
        return 'Ingresa un correo electrónico válido.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Espera unos minutos.';
      case 'auth/network-request-failed':
        return 'Sin conexión. Revisa tu internet.';
      case 'auth/user-disabled':
        return 'Esta cuenta está suspendida. Contacta al administrador.';
      default:
        return 'No se pudo procesar la cuenta. Inténtalo de nuevo.';
    }
  };

  /** Carga el perfil de Firestore o lo crea si es la primera vez de la cuenta. */
  const loadOrCreateProfile = async (
    uid: string,
    defaults: Partial<UserProfileData>
  ): Promise<UserProfileData> => {
    const existing = await getUserProfile(uid);
    if (existing) return existing;

    const profile: UserProfileData = {
      id: uid,
      name: defaults.name || 'Usuario',
      email: defaults.email,
      phone: defaults.phone,
      city: defaults.city || 'San Pedro de Macorís',
      avatar: defaults.avatar,
      rating: 5.0,
      salesCount: 0,
      joinedDate: new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' }),
      isVerified: defaults.isVerified ?? false,
      role: 'buyer',
      favorites: [],
    };
    await createUserProfile(profile);
    return profile;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanEmail) {
      setErrorMsg('Ingresa tu correo electrónico');
      return;
    }

    if (mode === 'register' && cleanName.length < 3) {
      setErrorMsg('Ingresa tu nombre completo.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!isFirebaseConfigured) {
      setErrorMsg('Firebase no está configurado. Revisa las variables de entorno.');
      return;
    }

    setLoading(true);

    try {
      const auth = getFirebaseAuth();

      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = credential.user;

        let avatarUrl = '';
        if (avatarFile) {
          avatarUrl = await uploadImage(avatarFile, `users/${fbUser.uid}/avatar-${Date.now()}.jpg`);
        }

        await updateProfile(fbUser, {
          displayName: cleanName,
          photoURL: avatarUrl || null,
        });

        const profile = await loadOrCreateProfile(fbUser.uid, {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || undefined,
          city,
          avatar: avatarUrl || undefined,
          isVerified: false,
        });

        onLoginSuccess(profile);
        return;
      }

      const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = credential.user;
      const profile = await loadOrCreateProfile(fbUser.uid, {
        name: fbUser.displayName || cleanEmail.split('@')[0],
        email: fbUser.email || cleanEmail,
        avatar: fbUser.photoURL || undefined,
        isVerified: fbUser.emailVerified,
      });

      onLoginSuccess(profile);
    } catch (error) {
      setErrorMsg(mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const fbUser = result.user;

      const profile = await loadOrCreateProfile(fbUser.uid, {
        name: fbUser.displayName || 'Usuario',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || undefined,
        isVerified: true,
      });

      onLoginSuccess(profile);
    } catch (error) {
      const code = (error as { code?: string }).code;

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-requested') {
        setErrorMsg('Cerraste la ventana de Google. Inténtalo de nuevo.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('El navegador bloqueó la ventana. Permite las ventanas emergentes.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Sin conexión. Revisa tu internet.');
      } else {
        setErrorMsg('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-[#121316] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-white p-5 sm:p-6 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF8A3D] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zyplaza LOCAL</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
            Regístrate o inicia sesión <span className="text-[#FF8A3D] font-semibold">{titleActionReason}</span>.
          </p>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-[#FF6A00] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-[#FF6A00] text-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Quick Social / Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">o con tu datos</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {/* Full Name field if register */}
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">Foto de Perfil (Opcional)</label>
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-[#FF8A3D] transition-all overflow-hidden"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <p className="text-[9px] text-white/40 mt-1">JPG, PNG (Máx 5MB)</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-white/80">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
              />
            </div>
          </div>

          {/* WhatsApp opcional al registrarse */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/80">WhatsApp (Opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 809-555-0199"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-white/80">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF8A3D]"
              />
            </div>
          </div>

          {/* City Selection for Register */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-white/80">Tu Ciudad</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#1A1B1F] border border-white/10 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF8A3D]"
              >
                <option value="San Pedro de Macorís">San Pedro de Macorís</option>
                <option value="Santo Domingo">Santo Domingo</option>
                <option value="Santiago">Santiago</option>
                <option value="La Romana">La Romana</option>
                <option value="Punta Cana">Punta Cana</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#FF6A00] to-[#e85f00] text-black font-extrabold text-xs sm:text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#FF6A00]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Ingresar a mi Cuenta' : 'Completar Registro'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Trust Note */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex items-center gap-2 text-[10px] text-white/60">
          <ShieldCheck className="w-4 h-4 text-[#FF8A3D] flex-shrink-0" />
          <span>
            Tus datos están protegidos. Zyplaza no comparte tu teléfono sin tu consentimiento.
          </span>
        </div>
      </div>
    </div>
  );
};
