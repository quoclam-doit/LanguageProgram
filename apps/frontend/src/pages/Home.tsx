import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Cards, Sparkle, Brain, Flame, ArrowRight, CheckCircle, ShieldCheck, ChartLineUp } from '@phosphor-icons/react';
import { useAuth } from '../store/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-600/20 via-indigo-900/10 to-transparent blur-3xl" />

      {/* Hero Section */}
      <section className="mx-auto flex min-h-[calc(100dvh-68px)] max-w-7xl flex-col justify-center px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Hero Copy (Max 4 elements: Eyebrow, Headline, Subtext, CTAs) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start lg:col-span-7"
          >
            {/* 1. Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-300">
              <Sparkle weight="fill" className="h-3.5 w-3.5 text-indigo-400" />
              <span>Thuật toán FSRS SRS Thông minh</span>
            </div>

            {/* 2. Headline */}
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Ghi nhớ từ vựng tiếng Anh <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">vĩnh viễn</span> không quên.
            </h1>

            {/* 3. Subtext (Max 20 words) */}
            <p className="mt-5 max-w-[60ch] text-base text-slate-400 sm:text-lg leading-relaxed">
              Hệ thống học thẻ nhớ SRS tối ưu khoảng thời gian ôn tập tự động. Dịch giải thích chuẩn ngữ cảnh Việt Nam.
            </p>

            {/* 4. CTAs (Primary + Secondary) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98]"
                >
                  <span>Vào Bảng Học Tập</span>
                  <ArrowRight weight="bold" className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98]"
                  >
                    <span>Bắt đầu Học Miễn Phí</span>
                    <ArrowRight weight="bold" className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/decks"
                    className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
                  >
                    <span>Khám phá bộ thẻ</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Right Visual Component (Interactive Card Preview) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-5"
          >
            <div className="glass-panel relative rounded-2xl p-6 sm:p-8">
              {/* Top Card Badge */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-400">Oxford 3000 Deck</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-400 border border-emerald-500/20">
                  SRS Due Today
                </span>
              </div>

              {/* Card Word Preview */}
              <div className="mt-6 text-center">
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Perseverance
                </h2>
                <p className="mt-1 text-sm font-mono text-slate-400">/ˌpɜː.sɪˈvɪə.rəns/</p>

                <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Nghĩa tiếng Việt:</span>
                  <p className="mt-1 text-base font-semibold text-emerald-300">
                    Tính kiên trì, sự nhẫn nại bền bỉ vượt qua khó khăn
                  </p>
                  <p className="mt-2 text-xs italic text-slate-400">
                    "Through hard work and perseverance, she reached her goals."
                  </p>
                </div>

                {/* SRS Rating Buttons Simulated */}
                <div className="mt-6 grid grid-cols-4 gap-2">
                  <button className="flex flex-col items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20">
                    <span>Again</span>
                    <span className="text-[10px] opacity-75">1 phút</span>
                  </button>
                  <button className="flex flex-col items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20">
                    <span>Hard</span>
                    <span className="text-[10px] opacity-75">12 giờ</span>
                  </button>
                  <button className="flex flex-col items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20">
                    <span>Good</span>
                    <span className="text-[10px] opacity-75">3 ngày</span>
                  </button>
                  <button className="flex flex-col items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20">
                    <span>Easy</span>
                    <span className="text-[10px] opacity-75">7 ngày</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Bento Section (Rhythm, 3 Asymmetric Tiles) */}
      <section className="border-t border-slate-900 bg-slate-950/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Kiến trúc Học Ngôn ngữ Tối ưu
            </h2>
            <p className="mt-3 text-base text-slate-400 max-w-[65ch] mx-auto">
              Ứng dụng nguyên lý khoa học trí nhớ và giải thuật FSRS giúp bạn tiết kiệm 70% thời gian ôn tập.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Tile 1 */}
            <div className="glass-card flex flex-col justify-between rounded-2xl p-6 sm:p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Brain weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-white">FSRS SRS Engine</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Tự động tính toán đường cong quên (Forgetting Curve) chính xác cho từng từ vựng riêng biệt của bạn.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <CheckCircle weight="fill" className="h-4 w-4" />
                <span>Không ôn thừa, không quên sót</span>
              </div>
            </div>

            {/* Tile 2 */}
            <div className="glass-card flex flex-col justify-between rounded-2xl p-6 sm:p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Cards weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-white">Tra từ & Dịch Đa tầng</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Tự động lấy IPA, file phát âm bản xứ và dịch nghĩa tiếng Việt chuẩn ngữ cảnh với fallback LLM AI.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck weight="fill" className="h-4 w-4" />
                <span>DictionaryStore Cache toàn hệ thống</span>
              </div>
            </div>

            {/* Tile 3 */}
            <div className="glass-card flex flex-col justify-between rounded-2xl p-6 sm:p-8">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <ChartLineUp weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-white">Gamification & Streak</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Tích lũy XP, duy trì chuỗi Streak hàng ngày theo múi giờ cá nhân và theo dõi bảng cấp độ Level tiến bộ.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Flame weight="fill" className="h-4 w-4" />
                <span>Tạo động lực duy trì thói quen học</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
