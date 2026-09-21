import { useState, type FormEvent } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { authClient } from '@/api/auth-client';
import { useAuth } from '@/auth/auth-context';

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/notes';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 已登录直接回原目标
  if (!isPending && user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await authClient.signIn.email({ email, password, rememberMe: true });
      navigate(from, { replace: true });
    } catch {
      setError(t('auth.errors.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-surface p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{t('auth.signInTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('common.motto')}</p>
        </div>

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
            autoComplete="current-password"
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
          {submitting ? '…' : t('auth.signIn')}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.goRegister')}
          </Link>
        </p>
      </form>
    </div>
  );
}