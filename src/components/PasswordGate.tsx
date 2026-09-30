import { useState, type FormEvent, type ReactNode } from 'react';

// Asks for the prototype password once per browser session. Only the SHA-256
// of the password ships in the bundle, but this is a soft gate for sharing
// links, not real access control.
const PASSWORD_SHA256 = '619960515fc76fb73e83f665adf597bd8c22da1815375350b5405b5c612c36b5';
const SESSION_KEY = 'miethke-unlocked';

async function sha256(text: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

function readUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    const ok = (await sha256(value)) === PASSWORD_SHA256;
    setChecking(false);
    if (!ok) {
      setError(true);
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Storage blocked: unlock for this page load only.
    }
    setUnlocked(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-canvas p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-[360px] rounded-2xl border border-line bg-white p-8 shadow-sm"
      >
        <h1 className="m-0 text-xl font-medium text-ink">Clarisa Prototype</h1>
        <p className="mt-2 mb-6 text-sm text-muted">Enter the password to view the prototype.</p>
        <label htmlFor="prototype-password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="prototype-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          aria-invalid={error}
          aria-describedby={error ? 'prototype-password-error' : undefined}
          className={`box-border w-full rounded-lg border px-3 py-2.5 text-base text-ink outline-none focus:border-brand focus:ring-2 focus:ring-accent-ultralight ${
            error ? 'border-danger' : 'border-line'
          }`}
        />
        {error && (
          <p id="prototype-password-error" className="mt-1.5 mb-0 text-sm text-danger">
            Incorrect password.
          </p>
        )}
        <button
          type="submit"
          disabled={!value || checking}
          className="mt-6 w-full cursor-pointer rounded-lg border-0 bg-brand py-3 text-base font-medium text-white hover:bg-brand-dark disabled:cursor-default disabled:opacity-50"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
