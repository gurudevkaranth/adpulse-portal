import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Mail, Building2, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import apiClient from '../api/client';

const BASE = import.meta.env.VITE_API_BASE_URL;

function oauthUrl(provider) {
  const redirectTo = encodeURIComponent(window.location.origin);
  return `${BASE}/v1/auth/${provider}?redirectTo=${redirectTo}`;
}

// Inline Google "G" SVG — avoids using Chrome icon which is incorrect
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// Microsoft logo
function MicrosoftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

const OAUTH_PROVIDERS = [
  {
    provider: 'google',
    label: 'Continue with Google',
    icon: GoogleIcon,
  },
  {
    provider: 'microsoft',
    label: 'Continue with Microsoft',
    icon: MicrosoftIcon,
  },
  {
    provider: 'okta',
    label: 'Continue with Okta',
    icon: Shield,
  },
];

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // If already authenticated (including mock mode), redirect to dashboard
  if (!loading && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError('');
    try {
      await apiClient.post('/v1/auth/magic-login', {
        email,
        redirectTo: window.location.origin,
      });
      setMagicSent(true);
    } catch {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4 relative overflow-hidden">
      {/* Subtle background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-50/60 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-lg shadow-black/[0.03]">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">AdPulse</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Sign in to your analytics dashboard
            </p>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2.5">
            {OAUTH_PROVIDERS.map(({ provider, label, icon: Icon }) => (
              <a
                key={provider}
                href={oauthUrl(provider)}
                className="group flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary hover:border-primary-200 hover:bg-primary-50/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-150"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                <ArrowRight className="h-4 w-4 text-text-tertiary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Magic Link */}
          {magicSent ? (
            <div className="rounded-xl bg-green-50 border border-green-100 p-5 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-800">
                Check your email
              </p>
              <p className="text-xs text-green-600 mt-1">
                We sent a sign-in link to <span className="font-medium">{email}</span>
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(''); }}
                className="mt-3 text-xs font-medium text-green-700 hover:text-green-800 underline underline-offset-2 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-border bg-surface-tertiary py-3 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-150"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-danger-50 border border-danger-400/20 px-4 py-3 text-center">
              <p className="text-xs font-medium text-danger-500">{error}</p>
            </div>
          )}
        </div>

        {/* Footer — outside card */}
        <p className="mt-6 text-center text-xs text-text-tertiary">
          Powered by{' '}
          <span className="font-medium text-text-secondary">Out of the Blue</span>
        </p>
      </div>
    </div>
  );
}
