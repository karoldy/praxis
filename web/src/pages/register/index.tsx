import { useState, type FormEvent } from 'react';
import { Navigate, Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { authClient } from '@/api/auth-client';
import { useAuth } from '@/auth/auth-context';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isPending && user) {
    return <Navigate to="/notes" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // 注册成功后 better-auth 会直接建立会话（返回 cookie）
      await authClient.signUp.email({ name, email, password });
      navigate('/notes', { replace: true });
    } catch {
      setError(t('auth.errors.emailInUse'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-surface p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{t('auth.signUpTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('common.motto')}</p>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">{t('auth.name')}</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">{t('auth.email')}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">{t('auth.password')}</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-2 text-on-primary font-medium transition-opacity disabled:opacity-60"
        >
          {submitting ? '…' : t('auth.signUp')}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.goLogin')}
          </Link>
        </p>
      </form>
    </div>
  );
}