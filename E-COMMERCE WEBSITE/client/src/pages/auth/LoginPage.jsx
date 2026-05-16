import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const { mergeCartOnLogin } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      await mergeCartOnLogin();
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In | LuxeShop</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="font-serif text-3xl text-text">
              Luxe<span className="text-accent">Shop</span>
            </Link>
            <h1 className="font-serif text-2xl text-text mt-4">Welcome back</h1>
            <p className="text-text-muted text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-error/10 border border-error/20 rounded p-3 text-sm text-error">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs text-accent hover:text-accent-light">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pr-11"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full btn-lg mt-2"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full" />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-base-surface px-4 text-xs text-text-subtle">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:text-accent-light font-medium">
                Create account
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 bg-base-elevated border border-base-border rounded-lg">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-text-subtle font-mono">
              <p>Admin: admin@luxeshop.com / Admin1234!</p>
              <p>Customer: customer@luxeshop.com / Customer1234!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
