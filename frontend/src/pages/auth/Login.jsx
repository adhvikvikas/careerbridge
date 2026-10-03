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
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base font-sans relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-lines-dark opacity-10 pointer-events-none mix-blend-overlay z-0"></div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-inverted flex-col justify-between px-16 py-20 relative z-10 border-r border-border-dark text-content-inverted">
        <div>
          <a href="/" className="text-2xl font-bold tracking-tighter hover:text-accent transition-colors">CAREERBRIDGE</a>
        </div>

        <div>
          <h1 className="text-6xl xl:text-8xl font-bold uppercase tracking-tighter leading-[0.85] mb-8">
            ENTER THE<br/>SYSTEM.
          </h1>
          <p className="text-xl text-content-inverted-muted max-w-md font-medium border-l-2 border-accent pl-6">
            Authenticate to access your institutional placement dashboard and recruitment workflows.
          </p>
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-content-inverted-muted flex gap-12">
          <div>SYS.SEC: <span className="text-accent">ACTIVE</span></div>
          <div>PROTOCOL: <span className="text-accent">AUTH_V2</span></div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden mb-16 border-b border-border-strong pb-8">
            <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">CAREERBRIDGE</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-content-muted">Authentication System</p>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-2">AUTHENTICATION.</h2>
            <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Provide your credentials</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-status-danger/10 border border-status-danger/20 text-status-danger text-xs font-bold uppercase tracking-widest">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@university.edu"
              required
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-widest text-content">
                  Password
                </label>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="inverted"
              className="w-full mt-4"
              loading={loading}
            >
              INITIALIZE LOGIN
            </Button>
          </form>

          <div className="mt-16 pt-8 border-t border-border-light text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
