import { useState } from 'react';
import { Mail, Chrome, Building2, Shield } from 'lucide-react';
import apiClient from '../api/client';

const BASE = import.meta.env.VITE_API_BASE_URL;

function oauthUrl(provider) {
  const redirectTo = encodeURIComponent(window.location.origin);
  return `${BASE}/v1/auth/${provider}?redirectTo=${redirectTo}`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold text-text-primary">AdPulse</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sign in to your analytics dashboard
          </p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <a
            href={oauthUrl('google')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition-colors"
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </a>
          <a
            href={oauthUrl('microsoft')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition-colors"
          >
            <Building2 className="h-5 w-5" />
            Continue with Microsoft
          </a>
          <a
            href={oauthUrl('okta')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition-colors"
          >
            <Shield className="h-5 w-5" />
            Continue with Okta
          </a>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-tertiary">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Magic Link */}
        {magicSent ? (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-700">
              Check your email for a sign-in link
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="mt-2 text-xs text-green-600 hover:underline"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-border bg-surface-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/30 focus:outline-none disabled:opacity-60 transition-colors"
            >
              {sending ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-3 text-center text-xs text-danger-500">{error}</p>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-text-tertiary">
          Powered by Out of the Blue
        </p>
      </div>
    </div>
  );
}
