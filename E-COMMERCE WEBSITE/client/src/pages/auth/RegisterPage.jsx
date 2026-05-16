import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'text-error', 'text-warning', 'text-info', 'text-success'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/');
  };

  const displayError = validationError || error;

  return (
    <>
      <Helmet>
        <title>Create Account | LuxeShop</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-3xl text-text">Luxe<span className="text-accent">Shop</span></Link>
            <h1 className="font-serif text-2xl text-text mt-4">Create your account</h1>
            <p className="text-text-muted text-sm mt-1">Join the LuxeShop community</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {displayError && (
                <div className="bg-error/10 border border-error/20 rounded p-3 text-sm text-error">{displayError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" value={form.name} onChange={update('name')} className="input" placeholder="Jane Doe" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={form.email} onChange={update('email')} className="input" placeholder="your@email.com" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} className="input pr-11" placeholder="Min 8 characters" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 rounded flex-1 transition-all ${i <= strength ? (strength <= 1 ? 'bg-error' : strength <= 2 ? 'bg-warning' : strength <= 3 ? 'bg-info' : 'bg-success') : 'bg-base-border'}`} />
                      ))}
                    </div>
                    <span className={`text-xs ${strengthColor}`}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} className="input pr-11" placeholder="Repeat password" required />
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />
                  )}
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg mt-2">
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full" />
                ) : <>Create Account <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-accent-light font-medium">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
