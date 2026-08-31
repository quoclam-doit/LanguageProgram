import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  SpeakerHigh,
  ArrowsClockwise,
  ArrowLeft,
  Trophy,
  Sparkle,
  BookOpen,
} from '@phosphor-icons/react';
import { srsService, DueItem } from '../services/srs.service';

export const StudySession: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // XP & Session Stats
  const [sessionXp, setSessionXp] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const fetchDueCards = async () => {
    if (!deckId) return;
    try {
      setLoading(true);
      const items = await srsService.getDueCards(deckId);
      setDueItems(items);
      if (items.length === 0) {
        setIsFinished(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueCards();
  }, [deckId]);

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

  const playPronunciation = () => {
    if (!currentItem?.card.term) return;
    const utter = new SpeechSynthesisUtterance(currentItem.card.term);
    utter.lang = 'en-US';
    window.speechSynthesis?.speak(utter);
  };

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
            Bạn đã ôn tập xuất sắc các thẻ từ vựng đến hạn hôm nay.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <span className="block text-2xl font-extrabold text-indigo-700">+{sessionXp} XP</span>
              <span className="text-xs font-semibold text-indigo-600">XP Nhận Được</span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <span className="block text-2xl font-extrabold text-emerald-700">{reviewedCount} Thẻ</span>
              <span className="text-xs font-semibold text-emerald-600">Đã Hoàn Thành</span>
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
                setIsFinished(false);
                setCurrentIndex(0);
                setSessionXp(0);
                setReviewedCount(0);
                fetchDueCards();
              }}
              className="btn-primary flex-1 py-3 rounded-xl text-xs font-bold"
            >
              Học Tiếp
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const card = currentItem.card;
  const progressPercent = Math.round(((currentIndex + 1) / dueItems.length) * 100);

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#faf9f6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Top Navigation & Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/decks')}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
            Thoát
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <BookOpen weight="bold" className="h-4 w-4" />
            <span>Thẻ {currentIndex + 1} / {dueItems.length}</span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>

        {/* Toast Notification XP */}
        <AnimatePresence>
          {xpToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-center rounded-xl bg-emerald-500 py-2.5 px-4 text-xs font-bold text-white shadow-md flex items-center justify-center gap-2"
            >
              <Sparkle weight="fill" className="h-4 w-4" />
              <span>{xpToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Flashcard Flip Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="perspective-1000 cursor-pointer rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition hover:border-indigo-300"
        >
          <div
            className={`transform-style-3d relative min-h-[340px] w-full transition-transform duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Side */}
            <div className="backface-hidden flex min-h-[340px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/90 p-6 text-slate-800">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-100 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                  {currentItem.userState.state === 'new' ? 'Từ Mới' : 'Cần Ôn Tập'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playPronunciation();
                  }}
                  title="Nghe phát âm chuẩn"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-2xs hover:bg-indigo-50 active:scale-95"
                >
                  <SpeakerHigh weight="bold" className="h-5 w-5" />
                </button>
              </div>

              <div className="my-auto text-center">
                <h2 className="font-heading text-4xl font-extrabold text-slate-900 sm:text-5xl">
                  {card.term}
                </h2>
                {card.ipa?.us && (
                  <p className="mt-2 font-mono text-base text-slate-500">{card.ipa.us}</p>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600">
                <ArrowsClockwise weight="bold" className="h-4 w-4 animate-spin" />
                <span>Nhấp vào thẻ để xem nghĩa & ví dụ tiếng Việt</span>
              </div>
            </div>

            {/* Back Side */}
            <div className="rotate-y-180 backface-hidden absolute inset-0 flex min-h-[340px] flex-col justify-between rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Nghĩa Tiếng Việt:
                </span>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">
                  {card.meanings.map((m) => m.text).join('; ')}
                </p>

                {card.examples?.[0] && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-2xs">
                    <p className="font-semibold text-slate-800">"{card.examples[0].en}"</p>
                    {card.examples[0].vi && (
                      <p className="mt-1 text-slate-500">{card.examples[0].vi}</p>
                    )}
                  </div>
                )}
              </div>

              {/* FSRS Rating Buttons */}
              <div onClick={(e) => e.stopPropagation()}>
                <p className="mb-2 text-center text-xs font-bold text-slate-600">
                  Đánh giá mức độ thuộc từ FSRS:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRate(1)}
                    className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 shadow-2xs"
                  >
                    <span>Quên (1)</span>
                    <span className="text-[10px] font-normal text-rose-500">10 phút</span>
                  </button>

                  <button
                    onClick={() => handleRate(2)}
                    className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 active:scale-95 shadow-2xs"
                  >
                    <span>Khó (2)</span>
                    <span className="text-[10px] font-normal text-amber-500">1 ngày</span>
                  </button>

                  <button
                    onClick={() => handleRate(3)}
                    className="flex flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 active:scale-95 shadow-2xs"
                  >
                    <span>Tốt (3)</span>
                    <span className="text-[10px] font-normal text-indigo-500">3 ngày</span>
                  </button>

                  <button
                    onClick={() => handleRate(4)}
                    className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 shadow-2xs"
                  >
                    <span>Dễ (4)</span>
                    <span className="text-[10px] font-normal text-emerald-500">7 ngày</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
