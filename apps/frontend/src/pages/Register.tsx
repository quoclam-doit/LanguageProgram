import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeSimple, Lock, User, UserPlus, WarningCircle } from '@phosphor-icons/react';
import { authService } from '../services/auth.service';
import { useAuth } from '../store/AuthContext';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
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
      const res = await authService.register({
        name,
        email,
        password,
        nativeLang: 'vi',
        targetLangs: ['en'],
        timezone: 'Asia/Ho_Chi_Minh',
      });

      if (res.success && res.data) {
        login(res.data.user);
        navigate('/dashboard');
      } else {
        setError(res.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-slate-950 px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tạo Tài Khoản LingoVerse
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Học từ vựng thông minh theo thuật toán SRS miễn phí
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm font-medium text-rose-300">
            <WarningCircle weight="bold" className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Họ và Tên <span className="text-rose-400">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-5 w-5 text-slate-400" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pr-4 pl-11 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Địa chỉ Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative flex items-center">
              <EnvelopeSimple className="absolute left-3.5 h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pr-4 pl-11 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Mật khẩu <span className="text-rose-400">*</span> (tối thiểu 6 ký tự)
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-5 w-5 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pr-4 pl-11 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <span>Đang tạo tài khoản...</span>
            ) : (
              <>
                <UserPlus weight="bold" className="h-5 w-5" />
                <span>Tạo Tài Khoản</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 transition hover:text-indigo-300 underline underline-offset-4">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
