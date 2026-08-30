import React from 'react';
import { Link } from 'react-router-dom';
import { Lightning, Fire, Cards, BookOpen, Plus, Play } from '@phosphor-icons/react';
import { useAuth } from '../store/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-slate-950 px-4">
        <div className="glass-panel text-center rounded-2xl p-8 max-w-md">
          <p className="text-slate-300">Vui lòng đăng nhập để truy cập Bảng học tập</p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Header */}
        <div className="glass-panel flex flex-col justify-between gap-6 rounded-2xl p-6 sm:p-8 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span>Học viên LingoVerse</span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Chào mừng trở lại, {user.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Hôm nay bạn có từ vựng cần ôn tập theo thuật toán FSRS.
            </p>
          </div>

          {/* Gamification Quick Stats */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-400">
              <Fire weight="fill" className="h-7 w-7 text-amber-500 animate-bounce" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Streak</p>
                <p className="font-heading text-lg font-bold">{user.streak.current} Ngày liên tiếp</p>
              </div>
            </div>

            {/* XP & Level */}
            <div className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-indigo-300">
              <Lightning weight="fill" className="h-7 w-7 text-indigo-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">Cấp độ (Level {user.level})</p>
                <p className="font-heading text-lg font-bold">{user.xp} XP tích lũy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Quick Action Tiles */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tile 1: Flashcard SRS Study */}
          <div className="glass-card flex flex-col justify-between rounded-2xl p-6 transition hover:border-indigo-500/40">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Cards weight="duotone" className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Sẵn sàng
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold text-white">Ôn Thẻ SRS Hôm Nay</h3>
              <p className="mt-1 text-sm text-slate-400">
                Thuật toán FSRS đã chọn lọc những từ vựng đến hạn ôn tập của bạn.
              </p>
            </div>
            <Link
              to="/decks"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              <Play weight="fill" className="h-4 w-4" />
              <span>Học Ngay (SRS Session)</span>
            </Link>
          </div>

          {/* Tile 2: Create Custom Deck */}
          <div className="glass-card flex flex-col justify-between rounded-2xl p-6 transition hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Plus weight="bold" className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold text-white">Tạo Bộ Thẻ Mới</h3>
              <p className="mt-1 text-sm text-slate-400">
                Tạo deck riêng hoặc import danh sách từ vựng CSV của bạn.
              </p>
            </div>
            <Link
              to="/decks/new"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white active:scale-[0.98]"
            >
              <Plus weight="bold" className="h-4 w-4" />
              <span>Tạo Deck Cá Nhận</span>
            </Link>
          </div>

          {/* Tile 3: Practice Quiz */}
          <div className="glass-card flex flex-col justify-between rounded-2xl p-6 transition hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <BookOpen weight="duotone" className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold text-white">Làm Bài Trắc Nghiệm</h3>
              <p className="mt-1 text-sm text-slate-400">
                Kiểm tra kiến thức phản xạ từ vựng với các câu hỏi MCQ, điền từ & nghe.
              </p>
            </div>
            <Link
              to="/quizzes"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white active:scale-[0.98]"
            >
              <BookOpen weight="bold" className="h-4 w-4" />
              <span>Làm Bài Quiz</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
