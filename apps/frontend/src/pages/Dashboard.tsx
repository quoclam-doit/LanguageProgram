import React from 'react';
import { Link } from 'react-router-dom';
import { Lightning, Fire, Cards, BookOpen, Plus, Play } from '@phosphor-icons/react';
import { useAuth } from '../store/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-slate-50 px-4">
        <div className="app-card max-w-md rounded-2xl p-8 text-center">
          <p className="text-slate-600 font-medium">Vui lòng đăng nhập để truy cập Bảng học tập</p>
          <Link
            to="/login"
            className="btn-primary mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold active:scale-95"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Header */}
        <div className="app-card flex flex-col justify-between gap-6 rounded-2xl p-6 sm:p-8 md:flex-row md:items-center">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600">
              BẢNG HỌC TẬP CÁ NHÂN
            </span>
            <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Chào mừng trở lại, {user.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Hôm nay bạn có các thẻ từ vựng cần ôn tập để ghi nhớ sâu hơn.
            </p>
          </div>

          {/* Gamification Quick Stats */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              <Fire weight="fill" className="h-7 w-7 text-amber-500 animate-bounce" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Streak</p>
                <p className="font-heading text-lg font-bold">{user.streak.current} Ngày liên tiếp</p>
              </div>
            </div>

            {/* XP & Level */}
            <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-800">
              <Lightning weight="fill" className="h-7 w-7 text-indigo-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Cấp độ (Level {user.level})</p>
                <p className="font-heading text-lg font-bold">{user.xp} XP tích lũy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Quick Action Tiles */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Tile 1: Flashcard Study */}
          <div className="app-card flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Cards weight="duotone" className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  Cần ôn hôm nay
                </span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate-900">Ôn Từ Vựng Hôm Nay</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Thẻ học thông minh đã chuẩn bị các từ vựng cần lặp lại đúng thời điểm cho bạn.
              </p>
            </div>
            <Link
              to="/decks"
              className="btn-primary mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold active:scale-[0.98]"
            >
              <Play weight="fill" className="h-4 w-4" />
              <span>Bắt Đầu Học Thẻ</span>
            </Link>
          </div>

          {/* Tile 2: Create Custom Deck */}
          <div className="app-card flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Plus weight="bold" className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-slate-400">Hỗ trợ file CSV</span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate-900">Tạo Bộ Thẻ Mới</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tạo deck riêng hoặc tải lên danh sách từ vựng cá nhân để tự học theo nhu cầu.
              </p>
            </div>
            <Link
              to="/decks/new"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
            >
              <Plus weight="bold" className="h-4 w-4" />
              <span>Tạo Deck Cá Nhận</span>
            </Link>
          </div>

          {/* Tile 3: Practice Quiz */}
          <div className="app-card flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <BookOpen weight="duotone" className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-slate-400">Luyện phản xạ</span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate-900">Làm Bài Trắc Nghiệm</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Kiểm tra mức độ thuộc từ vựng với các bài tập trắc nghiệm chọn đáp án & nghe.
              </p>
            </div>
            <Link
              to="/quizzes"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
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
