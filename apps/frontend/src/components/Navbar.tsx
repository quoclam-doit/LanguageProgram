import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightning, Fire, BookOpen, Cards, UserCircle, SignOut, SignIn, UserPlus } from '@phosphor-icons/react';
import { useAuth } from '../store/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 h-[68px] w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Lightning weight="bold" className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-white">LingoVerse</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">SRS Language Engine</span>
          </div>
        </Link>

        {/* Center Nav Items */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/decks"
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60 hover:text-white"
          >
            <Cards weight="duotone" className="h-4 w-4 text-indigo-400" />
            Bộ thẻ Flashcard
          </Link>
          <Link
            to="/quizzes"
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/60 hover:text-white"
          >
            <BookOpen weight="duotone" className="h-4 w-4 text-emerald-400" />
            Bài Trắc nghiệm
          </Link>
        </nav>

        {/* Right Status / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-sm">
                <Fire weight="fill" className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>{user.streak.current} Ngày</span>
              </div>

              {/* XP Badge */}
              <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm">
                <Lightning weight="fill" className="h-4 w-4 text-indigo-400" />
                <span>{user.xp} XP (Lv.{user.level})</span>
              </div>

              {/* Profile Link */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                <UserCircle weight="duotone" className="h-5 w-5 text-indigo-400" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
              >
                <SignOut weight="bold" className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 active:scale-95"
              >
                <SignIn weight="bold" className="h-4 w-4 text-indigo-400" />
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95"
              >
                <UserPlus weight="bold" className="h-4 w-4" />
                Tạo tài khoản
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
