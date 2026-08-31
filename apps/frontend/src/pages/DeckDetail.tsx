import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Cards,
  Plus,
  ArrowLeft,
  BookOpen,
  SpeakerHigh,
  Trash,
} from '@phosphor-icons/react';
import { deckService, DeckData } from '../services/deck.service';
import { cardService, CardData } from '../services/card.service';

export const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Card Modal State
  const [showAddCard, setShowAddCard] = useState(false);
  const [term, setTerm] = useState('');
  const [ipaUs, setIpaUs] = useState('');
  const [meaningVi, setMeaningVi] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [dData, cData] = await Promise.all([
        deckService.getDeckById(id),
        cardService.getCardsByDeck(id),
      ]);
      setDeck(dData);
      setCards(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !term.trim() || !meaningVi.trim()) return;

    try {
      await cardService.createCard(id, {
        term: term.trim(),
        ipa: ipaUs ? { us: ipaUs.trim() } : undefined,
        meanings: [{ langCode: 'vi', text: meaningVi.trim() }],
        examples: exampleEn ? [{ en: exampleEn.trim(), vi: exampleVi.trim() }] : [],
      });

      setTerm('');
      setIpaUs('');
      setMeaningVi('');
      setExampleEn('');
      setExampleVi('');
      setShowAddCard(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thẻ từ vựng này?')) return;
    try {
      await cardService.deleteCard(cardId);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-10 text-center font-bold text-slate-500">Đang tải chi tiết bộ thẻ...</div>;
  }

  if (!deck) {
    return <div className="min-h-screen p-10 text-center font-bold text-rose-600">Không tìm thấy bộ thẻ!</div>;
  }

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#faf9f6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Link */}
        <Link to="/decks" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-6">
          <ArrowLeft weight="bold" className="h-4 w-4" />
          <span>Quay lại Danh sách Bộ thẻ</span>
        </Link>

        {/* Deck Detail Header */}
        <div className="app-card rounded-3xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                {cards.length} Thẻ từ vựng
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase">
                {deck.langCode}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-3xl font-extrabold text-slate-900">{deck.title}</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{deck.description || 'Chưa có mô tả'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 shadow-2xs"
            >
              <Plus weight="bold" className="h-4 w-4" />
              <span>Thêm Từ Vựng</span>
            </button>
            <Link
              to={`/study/${deck._id}`}
              className="btn-primary flex items-center gap-2.5 rounded-xl px-6 py-3 text-xs font-bold active:scale-95 shadow-md"
            >
              <BookOpen weight="bold" className="h-4 w-4" />
              <span>Học FSRS Ngay</span>
            </Link>
          </div>
        </div>

        {/* Cards Table / Grid List */}
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">Danh sách từ vựng ({cards.length})</h2>

          {cards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center bg-white">
              <Cards weight="duotone" className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-600">Bộ thẻ này chưa có từ vựng nào.</p>
              <button
                onClick={() => setShowAddCard(true)}
                className="mt-4 btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
              >
                <Plus weight="bold" className="h-4 w-4" />
                Thêm từ vựng đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card._id}
                  className="app-card rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => {
                        const utter = new SpeechSynthesisUtterance(card.term);
                        utter.lang = 'en-US';
                        window.speechSynthesis?.speak(utter);
                      }}
                      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      <SpeakerHigh weight="bold" className="h-4 w-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-slate-900">{card.term}</h3>
                        {card.ipa?.us && (
                          <span className="font-mono text-xs text-slate-500">{card.ipa.us}</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {card.meanings.map((m) => m.text).join('; ')}
                      </p>
                      {card.examples?.[0] && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          "{card.examples[0].en}" — {card.examples[0].vi}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCard(card._id)}
                    className="text-slate-400 hover:text-rose-600 p-2 transition"
                  >
                    <Trash weight="bold" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
          >
            <h3 className="font-heading text-xl font-bold text-slate-900">Thêm Thẻ Từ Vựng Mới</h3>
            <form onSubmit={handleAddCard} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Từ gốc (English) *</label>
                <input
                  type="text"
                  required
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Ví dụ: Resilience"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Phiên âm IPA (US)</label>
                <input
                  type="text"
                  value={ipaUs}
                  onChange={(e) => setIpaUs(e.target.value)}
                  placeholder="Ví dụ: /rɪˈzɪl.jəns/"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  value={meaningVi}
                  onChange={(e) => setMeaningVi(e.target.value)}
                  placeholder="Ví dụ: Khả năng kiên cường phục hồi"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Ví dụ tiếng Anh</label>
                <input
                  type="text"
                  value={exampleEn}
                  onChange={(e) => setExampleEn(e.target.value)}
                  placeholder="Ví dụ: Her resilience was impressive."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Dịch nghĩa câu ví dụ</label>
                <input
                  type="text"
                  value={exampleVi}
                  onChange={(e) => setExampleVi(e.target.value)}
                  placeholder="Ví dụ: Sự kiên cường của cô ấy thật ấn tượng."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary rounded-xl px-5 py-2 text-xs font-bold">
                  Thêm Thẻ
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
