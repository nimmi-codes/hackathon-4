import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../AuthContext.jsx';
import { PageHeader } from '../components/UI.jsx';

export default function AuthPage({ mode }) {
  const signup = mode === 'signup';
  const { login, signup: doSignup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', staffCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = signup ? await doSignup(form) : await login(form.email, form.password);
      navigate(homeFor(user), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        tag={signup ? 'Join the portal' : 'Welcome back'}
        title={signup ? 'Create your' : 'Sign in to your'}
        accent={signup ? 'account' : 'portal'}
      />
      <form className="panel glass form narrow" onSubmit={submit}>
        {error && <div className="alert error" role="alert">{error}</div>}
        {signup && (
          <label>Name<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        )}
        <label>Email<input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={signup ? 6 : undefined}
            value={form.password}
            onChange={set('password')}
            autoComplete={signup ? 'new-password' : 'current-password'}
          />
        </label>
        {signup && (
          <label>
            Staff code (optional)
            <input value={form.staffCode} onChange={set('staffCode')} placeholder="Leave empty for a customer account" />
          </label>
        )}
        <button className="btn block" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Sign up' : 'Sign in'}</button>
        <p className="muted small center">
          {signup ? (
            <>Already registered? <Link to="/login">Sign in</Link></>
          ) : (
            <>New here? <Link to="/signup">Sign up</Link></>
          )}
        </p>
      </form>
    </>
  );
}
