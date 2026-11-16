import React, { useState } from 'react';
import { Wrench, Shield, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError(null);
    clearError();
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação via Google';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Preencha os campos de e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      setLocalError('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setLocalError(null);
    clearError();
    try {
      if (isRegisterMode) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message.includes('auth/invalid-credential')
            ? 'Credenciais incorretas ou usuário não encontrado.'
            : err.message.includes('auth/email-already-in-use')
            ? 'Este e-mail já está registrado no sistema.'
            : err.message
          : 'Erro ao autenticar usuário.';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    setLocalError(null);
    clearError();
    const demoEmail = 'operador.demo@simplitech.com.br';
    const demoPass = 'simplitech2026';
    try {
      await signInWithEmail(demoEmail, demoPass);
    } catch (err: unknown) {
      // Se não existir, tenta registrar
      try {
        await signUpWithEmail(demoEmail, demoPass);
      } catch (innerErr: unknown) {
        // Se já existia ou deu erro, tenta sign in novamente
        try {
          await signInWithEmail(demoEmail, demoPass);
        } catch {
          setLocalError('Não foi possível autenticar o acesso demo. Utilize sua conta Google ou crie um usuário corporativo abaixo.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-900 text-white shadow-xs mb-3">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          OptiService
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Assistência Técnica Simplitech &bull; Acesso Administrativo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-lg sm:px-10">
          {activeError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Autenticação Corporativa via Google */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded shadow-2xs bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-hidden disabled:opacity-60 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Conectando...' : 'Entrar com Conta Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleDemoAccess}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-blue-200 bg-blue-50/80 rounded text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors shadow-2xs disabled:opacity-60"
              title="Acessar o sistema como técnico de demonstração sem popups"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Acesso Rápido de Avaliação (1 Clique)</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400 font-medium">
                  ou acesse com e-mail corporativo
                </span>
              </div>
            </div>

            {/* Formulário E-mail / Senha */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  E-mail do operador / técnico
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tecnico@simplitech.com"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden pl-9"
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-hidden pl-9"
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-hidden disabled:opacity-60 transition-colors shadow-xs"
              >
                {loading
                  ? 'Processando...'
                  : isRegisterMode
                  ? 'Registrar Novo Operador'
                  : 'Entrar no Sistema'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setLocalError(null);
                  }}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  {isRegisterMode
                    ? 'Já possui conta? Clique para entrar'
                    : 'Não possui usuário? Clique para cadastrar'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Autenticação gerenciada via Firebase Authentication</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Persistência em tempo real via Cloud Firestore</span>
            </div>
          </div>
        </div>

        {/* Rodapé explicativo para projeto acadêmico */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Simplitech Assistência Técnica &bull; Sistema OptiService</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Ambiente acadêmico integrado à nuvem Google Cloud / Firebase
          </p>
        </div>
      </div>
    </div>
  );
};
