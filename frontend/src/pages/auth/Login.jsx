import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base font-sans p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-border-light rounded-2xl shadow-xl z-10 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-content tracking-tight mb-2">CareerBridge</h1>
            <p className="text-sm text-content-muted">Sign in to your institutional account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg text-sm text-status-danger font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-status-danger shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@university.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>
        
        <div className="px-8 py-5 bg-base/50 border-t border-border-light text-center">
          <p className="text-xs text-content-muted">
            Protected by Institutional Authentication. <a href="/" className="text-primary hover:underline font-medium">Return home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
