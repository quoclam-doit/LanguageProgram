import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { EnvelopeSimple, Lock, SignIn, WarningCircle, BookBookmark } from '@phosphor-icons/react';
import { authService } from '../services/auth.service';
import { useAuth } from '../store/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        login(res.data.user);
        navigate('/dashboard');
      } else {
        setError(res.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-68px)] items-center justify-center bg-[#faf9f6] px-4 py-12 text-slate-800 overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="app-card w-full max-w-md rounded-3xl p-8 shadow-xl"
      >
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25">
            <BookBookmark weight="bold" className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Đăng nhập LingoVerse
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Chào mừng trở lại! Tiếp tục hành trình học tiếng Anh ngay
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            <WarningCircle weight="bold" className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <EnvelopeSimple className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vd: hocvien@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pr-4 pl-11 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pr-4 pl-11 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="gradient-indigo-btn mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <span>Đang kiểm tra thông tin...</span>
            ) : (
              <>
                <SignIn weight="bold" className="h-5 w-5" />
                <span>Đăng Nhập Ngay</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-indigo-600 transition hover:text-indigo-700 underline underline-offset-4">
            Đăng ký tài khoản miễn phí
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
