import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookBookmark, Cards, BookOpen, Fire, Lightning, UserCircle, SignOut, SignIn, UserPlus } from '@phosphor-icons/react';
import { useAuth } from '../store/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 h-[68px] w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Monogram & Title */}
        <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
            <BookBookmark weight="bold" className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900">LingoVerse</span>
            <span className="text-[10px] font-bold text-indigo-600">Học Tiếng Anh Thông Minh</span>
          </div>
        </Link>

        {/* Center Nav Items */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/decks"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              isActive('/decks')
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Cards weight="duotone" className="h-4 w-4 text-indigo-600" />
            Bộ Thẻ Từ Vựng
          </Link>
          <Link
            to="/quizzes"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              isActive('/quizzes')
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen weight="duotone" className="h-4 w-4 text-indigo-600" />
            Bài Trắc Nghiệm
          </Link>
        </nav>

        {/* Right Status / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-xs font-extrabold text-amber-700 shadow-2xs">
                <Fire weight="fill" className="h-4 w-4 text-amber-500 animate-bounce" />
                <span>{user.streak.current} Ngày Streak</span>
              </div>

              {/* XP Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 text-xs font-extrabold text-indigo-700 shadow-2xs">
                <Lightning weight="fill" className="h-4 w-4 text-indigo-600" />
                <span>{user.xp} XP (Lv.{user.level})</span>
              </div>

              {/* Profile Link */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <UserCircle weight="duotone" className="h-5 w-5 text-indigo-600" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
              >
                <SignOut weight="bold" className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                <SignIn weight="bold" className="h-4 w-4 text-indigo-600" />
                <span>Đăng Nhập</span>
              </Link>
              <Link
                to="/register"
                className="gradient-indigo-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white active:scale-95"
              >
                <UserPlus weight="bold" className="h-4 w-4" />
                <span>Tạo Tài Khoản</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
