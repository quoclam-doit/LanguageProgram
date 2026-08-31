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
  Sparkle,
  DownloadSimple,
  CircleNotch,
} from '@phosphor-icons/react';
import { deckService, DeckData } from '../services/deck.service';
import { cardService, CardData } from '../services/card.service';
import { dictionaryService } from '../services/dictionary.service';
import { downloadCsvTemplate } from '../services/csvTemplate.service';

export const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Card Modal State
  const [showAddCard, setShowAddCard] = useState(false);
  const [term, setTerm] = useState('');
  const [ipaUs, setIpaUs] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [meaningVi, setMeaningVi] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupSuccess, setLookupSuccess] = useState(false);

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

  const handleAutoLookup = async () => {
    if (!term.trim() || lookupLoading) return;
    try {
      setLookupLoading(true);
      setLookupSuccess(false);
      const res = await dictionaryService.lookupPhonetic(term.trim());
      if (res) {
        if (res.ipa?.us || res.ipa?.uk) {
          setIpaUs(res.ipa.us || res.ipa.uk || '');
        }
        if (res.audioUrl) {
          setAudioUrl(res.audioUrl);
        }
        setLookupSuccess(true);
        setTimeout(() => setLookupSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Auto lookup error:', err);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !term.trim() || !meaningVi.trim()) return;

    try {
      await cardService.createCard(id, {
        term: term.trim(),
        partOfSpeech,
        ipa: ipaUs ? { us: ipaUs.trim() } : undefined,
        meanings: [{ langCode: 'vi', text: meaningVi.trim() }],
        examples: exampleEn ? [{ en: exampleEn.trim(), vi: exampleVi.trim() }] : [],
        audioUrl: audioUrl || undefined,
      });

      setTerm('');
      setIpaUs('');
      setAudioUrl('');
      setMeaningVi('');
      setPartOfSpeech('noun');
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadCsvTemplate}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 shadow-2xs"
              title="Tải file CSV mẫu chuẩn định dạng để import từ vựng"
            >
              <DownloadSimple weight="bold" className="h-4 w-4 text-emerald-600" />
              <span>Tải CSV Mẫu</span>
            </button>

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
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => setShowAddCard(true)}
                  className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
                >
                  <Plus weight="bold" className="h-4 w-4" />
                  Thêm từ vựng đầu tiên
                </button>
                <button
                  onClick={downloadCsvTemplate}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <DownloadSimple weight="bold" className="h-4 w-4 text-emerald-600" />
                  Tải CSV Mẫu
                </button>
              </div>
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
                        if (card.audioUrl) {
                          const audio = new Audio(card.audioUrl);
                          audio.play().catch(() => {
                            const utter = new SpeechSynthesisUtterance(card.term);
                            utter.lang = 'en-US';
                            window.speechSynthesis?.speak(utter);
                          });
                        } else {
                          const utter = new SpeechSynthesisUtterance(card.term);
                          utter.lang = 'en-US';
                          window.speechSynthesis?.speak(utter);
                        }
                      }}
                      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      title="Nghe phát âm"
                    >
                      <SpeakerHigh weight="bold" className="h-4 w-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-lg font-bold text-slate-900">{card.term}</h3>
                        {card.partOfSpeech && (
                          <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                            {card.partOfSpeech}
                          </span>
                        )}
                        {card.ipa?.us && (
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {card.ipa.us}
                          </span>
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
                    title="Xóa từ vựng"
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
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-slate-900">Thêm Thẻ Từ Vựng Mới</h3>
              {lookupSuccess && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 animate-fade-in">
                  <Sparkle weight="fill" className="h-3 w-3 text-emerald-500" />
                  Đã tự tìm IPA!
                </span>
              )}
            </div>

            <form onSubmit={handleAddCard} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Từ gốc (English) *</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onBlur={handleAutoLookup}
                    placeholder="Ví dụ: Resilience"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAutoLookup}
                    disabled={lookupLoading || !term.trim()}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                    title="Tra phiên âm tự động từ Dictionary API"
                  >
                    {lookupLoading ? (
                      <CircleNotch weight="bold" className="h-4 w-4 animate-spin text-indigo-600" />
                    ) : (
                      <Sparkle weight="bold" className="h-4 w-4 text-indigo-600" />
                    )}
                    <span>Tra IPA</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Từ loại (Part of Speech) *</label>
                <select
                  required
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="noun">Danh từ (noun)</option>
                  <option value="verb">Động từ (verb)</option>
                  <option value="adjective">Tính từ (adjective)</option>
                  <option value="adverb">Trạng từ (adverb)</option>
                  <option value="preposition">Giới từ (preposition)</option>
                  <option value="conjunction">Liên từ (conjunction)</option>
                  <option value="phrase">Cụm từ (phrase)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Phiên âm IPA (US/UK)</label>
                <input
                  type="text"
                  value={ipaUs}
                  onChange={(e) => setIpaUs(e.target.value)}
                  placeholder="Tự động tra hoặc nhập thủ công: /rɪˈzɪl.jəns/"
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
