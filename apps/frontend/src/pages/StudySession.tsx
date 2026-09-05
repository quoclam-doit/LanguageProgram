import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  SpeakerHigh,
  ArrowsClockwise,
  ArrowLeft,
  Trophy,
  Sparkle,
  BookOpen,
  CaretLeft,
  CaretRight,
  Info,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import { srsService, DueItem } from '../services/srs.service';
import { playAudioPronunciation } from '../utils/audioPlayer';

export const StudySession: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [sessionLimit, setSessionLimit] = useState<number>(30); // Default 30 cards per FSRS session
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // XP & Session Stats
  const [sessionXp, setSessionXp] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const fetchDueCards = useCallback(async (limit: number) => {
    if (!deckId) return;
    try {
      setLoading(true);
      const items = await srsService.getDueCards(deckId, limit);
      setDueItems(items);
      setCurrentIndex(0);
      setIsFlipped(false);
      if (items.length === 0) {
        setIsFinished(true);
      } else {
        setIsFinished(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchDueCards(sessionLimit);
  }, [deckId, sessionLimit, fetchDueCards]);

  const currentItem = dueItems[currentIndex];

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentItem || !deckId) return;

    try {
      const res = await srsService.reviewCard(currentItem.card._id, deckId, rating);
      setSessionXp((prev) => prev + res.xpEarned);
      setReviewedCount((prev) => prev + 1);

      setXpToast(`+${res.xpEarned} XP! (Tổng XP: ${res.totalXp})`);
      setTimeout(() => setXpToast(null), 1800);

      setIsFlipped(false);

      if (currentIndex + 1 < dueItems.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < dueItems.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard Shortcuts (Arrow Left, Arrow Right, Spacebar, 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || dueItems.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        handleNextCard();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        handlePrevCard();
      } else if (isFlipped) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, dueItems.length, isFlipped, isFinished]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="text-center font-bold text-indigo-600">Đang chuẩn bị thẻ học FSRS...</div>
      </div>
    );
  }

  if (isFinished || dueItems.length === 0) {
    return (
      <div className="min-h-[calc(100dvh-68px)] bg-[#faf9f6] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="app-card w-full max-w-lg rounded-3xl p-8 text-center shadow-xl border border-slate-200"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500 mb-4">
            <Trophy weight="fill" className="h-10 w-10 animate-bounce" />
          </div>

          <h2 className="font-heading text-3xl font-extrabold text-slate-900">
            Hoàn Thành Session Ôn Tập!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Bạn đã hoàn thành xuất sắc {reviewedCount} thẻ từ vựng trong lượt học này.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <span className="block text-2xl font-extrabold text-indigo-700">+{sessionXp} XP</span>
              <span className="text-xs font-semibold text-indigo-600">XP Nhận Được</span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <span className="block text-2xl font-extrabold text-emerald-700">{reviewedCount} Thẻ</span>
              <span className="text-xs font-semibold text-emerald-600">Đã Học Phản Xạ</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              to="/decks"
              className="flex-1 flex items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Về Danh Sách Bộ Thẻ
            </Link>
            <button
              onClick={() => {
                setSessionXp(0);
                setReviewedCount(0);
                fetchDueCards(sessionLimit);
              }}
              className="btn-primary flex-1 py-3 rounded-xl text-xs font-bold"
            >
              Học Tiếp Lượt Mới
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const card = currentItem.card;
  const progressPercent = Math.round(((currentIndex + 1) / dueItems.length) * 100);

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#faf9f6] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="mx-auto max-w-3xl w-full">
        {/* ROCK SOLID Header Bar with Fixed 3 Slot Layout to Eliminate Any Shifting */}
        <div className="grid grid-cols-12 items-center gap-2 mb-4 h-12 shrink-0">
          {/* Left Slot: Exit Button */}
          <div className="col-span-3 flex items-center">
            <button
              onClick={() => navigate('/decks')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft weight="bold" className="h-4 w-4" />
              <span>Thoát</span>
            </button>
          </div>

          {/* Center Slot: Fixed Width Limit Selector */}
          <div className="col-span-6 flex justify-center">
            <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-slate-200 px-3 py-1.5 shadow-2xs">
              <SlidersHorizontal weight="bold" className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">Số thẻ:</span>
              <div className="flex items-center gap-1">
                {[15, 30, 50, 0].map((limitOption) => (
                  <button
                    key={limitOption}
                    onClick={() => setSessionLimit(limitOption)}
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition min-w-[28px] text-center ${
                      sessionLimit === limitOption
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {limitOption === 0 ? 'Tất cả' : limitOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Slot: Fixed Monospace Counter */}
          <div className="col-span-3 flex items-center justify-end">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 py-1">
              <BookOpen weight="bold" className="h-3.5 w-3.5 shrink-0" />
              <span>{currentIndex + 1} / {dueItems.length}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-4 shrink-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>

        {/* Fixed Height Banner Explaining FSRS Default Limit */}
        {showInfoBanner && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 flex items-center justify-between gap-2 text-xs text-indigo-900 h-[48px] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Info weight="fill" className="h-4 w-4 shrink-0 text-indigo-600" />
              <p className="truncate">
                <strong className="font-bold">Thuật toán FSRS:</strong> Mặc định <strong>30 từ/lượt</strong> để tối ưu trí nhớ. Bạn có thể chọn <strong>50</strong> hoặc <strong>Tất cả</strong> ở trên!
              </p>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="text-indigo-400 hover:text-indigo-700 text-xs font-bold px-1 shrink-0"
              title="Ẩn thông báo này"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Card with Navigation Side Arrows - STRICT FIXED HEIGHT h-[400px] & ABSOLUTE FLOATING TOAST */}
        <div className="relative flex items-center gap-2 sm:gap-4 mt-2">
          {/* Absolute Floating XP Toast - ZERO Layout Shift */}
          <AnimatePresence>
            {xpToast && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute -top-11 right-12 z-30 rounded-xl bg-emerald-600 py-1 px-3 text-xs font-bold text-white shadow-lg flex items-center gap-1.5 border border-emerald-400"
              >
                <Sparkle weight="fill" className="h-3.5 w-3.5 text-amber-300" />
                <span>{xpToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Previous Card Button */}
          <button
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
            title="Thẻ phía trước (Phím mũi tên Trái)"
          >
            <CaretLeft weight="bold" className="h-6 w-6" />
          </button>

          {/* 3D Flashcard Flip Container - FIXED HEIGHT h-[400px] */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 flex-1 cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl transition hover:border-indigo-300 h-[400px] relative overflow-hidden"
          >
            <div
              className={`transform-style-3d relative h-full w-full transition-transform duration-500 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Side - STRICT ABSOLUTE INSET-0 */}
              <div className="backface-hidden absolute inset-0 h-full w-full flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/90 p-6 text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-100 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                    {currentItem.userState.state === 'new' ? 'Từ Mới' : 'Cần Ôn Tập'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudioPronunciation(card.term, card.audioUrl);
                    }}
                    title="Nghe phát âm chuẩn"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-2xs hover:bg-indigo-50 active:scale-95"
                  >
                    <SpeakerHigh weight="bold" className="h-5 w-5" />
                  </button>
                </div>

                <div className="my-auto text-center px-4">
                  <h2 className="font-heading text-4xl font-extrabold text-slate-900 sm:text-5xl line-clamp-2">
                    {card.term}
                  </h2>
                  {card.partOfSpeech && (
                    <span className="inline-block mt-3 rounded-md bg-indigo-50 border border-indigo-100 px-3 py-0.5 font-mono text-xs font-bold text-indigo-700">
                      {card.partOfSpeech}
                    </span>
                  )}
                  {card.ipa?.us && (
                    <p className="mt-2 font-mono text-base text-slate-500">{card.ipa.us}</p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600">
                  <ArrowsClockwise weight="bold" className="h-4 w-4 animate-spin" />
                  <span>Nhấp vào thẻ hoặc bấm phím Space để xem nghĩa</span>
                </div>
              </div>

              {/* Back Side - STRICT ABSOLUTE INSET-0 */}
              <div className="rotate-y-180 backface-hidden absolute inset-0 h-full w-full flex flex-col justify-between rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6">
                <div className="overflow-y-auto pr-1 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Nghĩa Tiếng Việt:
                  </span>
                  <p className="font-heading text-2xl font-bold text-slate-900 leading-snug">
                    {card.meanings.map((m) => m.text).join('; ')}
                  </p>

                  {card.examples?.[0] && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-2xs">
                      <p className="font-semibold text-slate-800">"{card.examples[0].en}"</p>
                      {card.examples[0].vi && (
                        <p className="mt-1 text-slate-500">{card.examples[0].vi}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* FSRS Rating Buttons */}
                <div onClick={(e) => e.stopPropagation()} className="pt-2">
                  <p className="mb-2 text-center text-xs font-bold text-slate-600">
                    Đánh giá mức độ thuộc từ FSRS (Phím 1-4):
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRate(1)}
                      className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 shadow-2xs"
                    >
                      <span>Quên (1)</span>
                      <span className="text-[10px] font-normal text-rose-500">10 phút</span>
                    </button>

                    <button
                      onClick={() => handleRate(2)}
                      className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 active:scale-95 shadow-2xs"
                    >
                      <span>Khó (2)</span>
                      <span className="text-[10px] font-normal text-amber-500">1 ngày</span>
                    </button>

                    <button
                      onClick={() => handleRate(3)}
                      className="flex flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 active:scale-95 shadow-2xs"
                    >
                      <span>Tốt (3)</span>
                      <span className="text-[10px] font-normal text-indigo-500">3 ngày</span>
                    </button>

                    <button
                      onClick={() => handleRate(4)}
                      className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 shadow-2xs"
                    >
                      <span>Dễ (4)</span>
                      <span className="text-[10px] font-normal text-emerald-500">7 ngày</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Card Button */}
          <button
            onClick={handleNextCard}
            disabled={currentIndex === dueItems.length - 1}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-md hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
            title="Thẻ kế tiếp (Phím mũi tên Phải)"
          >
            <CaretRight weight="bold" className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom Auxiliary Navigation Actions */}
        <div className="mt-6 flex items-center justify-between pb-6">
          <button
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            <CaretLeft weight="bold" className="h-4 w-4" />
            <span>Thẻ trước</span>
          </button>

          <span className="text-xs font-bold text-slate-400">
            Dùng phím <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-md">Space</kbd> để lật thẻ, <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-md">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-md">→</kbd> để qua thẻ
          </span>

          <button
            onClick={handleNextCard}
            disabled={currentIndex === dueItems.length - 1}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            <span>Thẻ tiếp</span>
            <CaretRight weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
