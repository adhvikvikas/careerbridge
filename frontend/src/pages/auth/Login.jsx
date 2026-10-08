import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Eye, EyeOff, GraduationCap, Building2, Users, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import campusImage from '../../assets/careerbridge-campus-hero.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  
  const [selectedRole, setSelectedRole] = useState(() => {
    if (initialRole && ['student', 'recruiter', 'admin'].includes(initialRole.toLowerCase())) {
      return initialRole.toLowerCase();
    }
    return 'student';
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      if (user.role.toLowerCase() !== selectedRole.toLowerCase()) {
        logout();
        throw new Error(`Your account does not have ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} access. Please select the correct role.`);
      }
      
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      
      if (user.role.toLowerCase() !== selectedRole.toLowerCase()) {
        logout();
        throw new Error(`Your account does not have ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} access. Please select the correct role.`);
      }
      
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base font-sans relative">
      {/* LEFT SIDE: Branding & Institutional Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-base overflow-hidden border-r border-border-light">
        
        {/* Full-height campus image */}
        <img 
          src={campusImage} 
          alt="Campus" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Soft editorial blend (ivory gradient) for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-base via-base/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-base/80 via-base/30 to-transparent" />

        {/* Top Text Content */}
        <div className="relative z-10 w-full pt-12 px-12 xl:px-16">
          <div className="flex items-center gap-2 mb-16">
            <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-navy hover:opacity-80 transition-opacity">
              Career<span className="text-primary">Bridge</span>
            </Link>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
            Institutional Recruitment Platform
          </div>

          <h1 className="text-5xl xl:text-6xl font-serif font-bold tracking-tight text-navy leading-[1.1]">
            Build your<br />
            career.<br />
            <span className="text-primary">Bridge</span><br />
            opportunities.
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: Login Card */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-surface sm:bg-base">
        {/* Back to Home Link (Top Right) */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-12 z-20">
          <Link to="/" className="flex items-center text-sm font-medium text-content-muted hover:text-navy transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[440px] bg-surface sm:border sm:border-border-light sm:shadow-xl sm:shadow-navy/5 rounded-2xl overflow-hidden p-8 sm:p-10 relative">
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-8">
                <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-navy hover:opacity-80 transition-opacity">
                  Career<span className="text-primary">Bridge</span>
                </Link>
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-navy mb-2">Welcome back</h2>
              <p className="text-content-muted text-sm">Sign in to your CareerBridge account</p>
            </div>

            {/* Role Selector UX */}
            <div className="grid grid-cols-3 gap-2 mb-8 p-1 bg-base rounded-lg border border-border-light">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all ${
                  selectedRole === 'student' 
                    ? 'bg-surface shadow-sm text-primary border border-primary/20' 
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('recruiter')}
                className={`flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all ${
                  selectedRole === 'recruiter' 
                    ? 'bg-surface shadow-sm text-primary border border-primary/20' 
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                Recruiter
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex items-center justify-center py-2 text-xs font-medium rounded-md transition-all ${
                  selectedRole === 'admin' 
                    ? 'bg-surface shadow-sm text-primary border border-primary/20' 
                    : 'text-content-muted hover:text-content'
                }`}
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Admin
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg text-sm text-status-danger font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-status-danger shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-content-muted hover:text-navy focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full shadow-sm hover:-translate-y-0.5 transition-transform"
                  loading={loading}
                >
                  Sign In <span className="ml-2">→</span>
                </Button>
              </div>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-4 text-content-muted uppercase font-medium">OR</span>
                </div>
              </div>

              <div className="w-full flex justify-center mt-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In was cancelled or failed.')}
                  width="100%"
                  theme="outline"
                  size="large"
                />
              </div>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
}
