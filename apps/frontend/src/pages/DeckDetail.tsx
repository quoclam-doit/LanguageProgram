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
  UploadSimple,
  CircleNotch,
  MagnifyingGlass,
  SquaresFour,
  ListBullets,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { deckService, DeckData } from '../services/deck.service';
import { cardService, CardData } from '../services/card.service';
import { dictionaryService } from '../services/dictionary.service';
import { downloadCsvTemplate } from '../services/csvTemplate.service';
import { ImportCsvModal } from '../components/ImportCsvModal';
import { playAudioPronunciation } from '../utils/audioPlayer';

export const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [deck, setDeck] = useState<DeckData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & View Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Add Card Form State
  const [showAddCard, setShowAddCard] = useState(false);
  const [showImportCsv, setShowImportCsv] = useState(false);

  const [term, setTerm] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [ipaUs, setIpaUs] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [meaningVi, setMeaningVi] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupSuccess, setLookupSuccess] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [deckRes, cardsRes] = await Promise.all([
        deckService.getDeckById(id),
        cardService.getCardsByDeck(id),
      ]);
      setDeck(deckRes);
      setCards(cardsRes);
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
    if (!term.trim()) return;
    try {
      setLookupLoading(true);
      setLookupSuccess(false);
      const res = await dictionaryService.lookupPhonetic(term.trim());
      if (res) {
        if (res.ipa?.us) setIpaUs(res.ipa.us);
        if (res.audioUrl) setAudioUrl(res.audioUrl);
        setLookupSuccess(true);
        setTimeout(() => setLookupSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Phonetic lookup failed:', err);
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
        meanings: [{ langCode: 'vi', text: meaningVi.trim(), partOfSpeech }],
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

  // Filtered Cards Logic
  const filteredCards = cards.filter((card) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const matchTerm = card.term.toLowerCase().includes(query);
    const matchMeaning = card.meanings.some((m) => m.text.toLowerCase().includes(query));
    const matchPos = card.partOfSpeech?.toLowerCase().includes(query);
    return matchTerm || matchMeaning || matchPos;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCards = filteredCards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div className="min-h-screen p-10 text-center font-bold text-slate-500">Đang tải chi tiết bộ thẻ...</div>;
  }

  if (!deck) {
    return <div className="min-h-screen p-10 text-center font-bold text-rose-600">Không tìm thấy bộ thẻ!</div>;
  }

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#faf9f6] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="mx-auto max-w-6xl w-full">
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
              onClick={() => setShowImportCsv(true)}
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 active:scale-95 shadow-2xs"
              title="Import từ vựng hàng loạt bằng file CSV"
            >
              <UploadSimple weight="bold" className="h-4 w-4 text-indigo-600" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={downloadCsvTemplate}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 shadow-2xs"
              title="Tải file CSV mẫu chuẩn định dạng IELTS để import từ vựng"
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

        {/* Toolbar: Search, View Mode Toggle, Pagination Summary */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm từ vựng hoặc nghĩa tiếng Việt..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm shadow-2xs focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng Lưới (Grid Compact)"
              >
                <SquaresFour weight="bold" className="h-4 w-4" />
                <span>Lưới</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng Danh sách chi tiết"
              >
                <ListBullets weight="bold" className="h-4 w-4" />
                <span>Danh sách</span>
              </button>
            </div>

            {/* Total Results Summary */}
            <span className="text-xs font-semibold text-slate-500">
              {filteredCards.length} từ
            </span>
          </div>
        </div>

        {/* Cards Container with Strict Minimum Height to prevent Page Jump */}
        <div className="mt-6 min-h-[580px]">
          {filteredCards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center bg-white min-h-[400px] flex flex-col items-center justify-center">
              <Cards weight="duotone" className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {searchQuery ? 'Không tìm thấy từ vựng nào khớp với từ khóa.' : 'Bộ thẻ này chưa có từ vựng nào.'}
              </p>
              {!searchQuery && (
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
                  >
                    <Plus weight="bold" className="h-4 w-4" />
                    Thêm từ vựng đầu tiên
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Fixed Uniform Height Grid Cards (3x4 = 12 cards layout) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCards.map((card) => (
                <div
                  key={card._id}
                  className="app-card rounded-2xl p-4 flex flex-col justify-between border border-slate-200 bg-white hover:border-indigo-300 transition shadow-2xs h-[156px]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-base font-bold text-slate-900 truncate" title={card.term}>
                          {card.term}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {card.partOfSpeech && (
                            <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700 truncate max-w-[120px]">
                              {card.partOfSpeech}
                            </span>
                          )}
                          {card.ipa?.us && (
                            <span className="font-mono text-[11px] text-slate-400 truncate">
                              {card.ipa.us}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => playAudioPronunciation(card.term, card.audioUrl)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          title="Nghe phát âm"
                        >
                          <SpeakerHigh weight="bold" className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600"
                          title="Xóa từ"
                        >
                          <Trash weight="bold" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-700 line-clamp-2" title={card.meanings.map((m) => m.text).join('; ')}>
                      {card.meanings.map((m) => m.text).join('; ')}
                    </p>
                  </div>

                  {card.examples?.[0] ? (
                    <p className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic truncate" title={card.examples[0].en}>
                      "{card.examples[0].en}"
                    </p>
                  ) : (
                    <div className="pt-2 border-t border-transparent h-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Detailed List View */
            <div className="space-y-3">
              {paginatedCards.map((card) => (
                <div
                  key={card._id}
                  className="app-card rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => playAudioPronunciation(card.term, card.audioUrl)}
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

        {/* Stable Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 pb-6">
            <span className="text-xs font-semibold text-slate-500">
              Hiển thị {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredCards.length)} trên tổng số {filteredCards.length} từ
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <CaretLeft weight="bold" className="h-3.5 w-3.5" />
                <span>Trước</span>
              </button>

              <span className="text-xs font-bold text-slate-700 px-2">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <span>Sau</span>
                <CaretRight weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
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
                <input
                  type="text"
                  required
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  placeholder="Ví dụ: adjective phrase, noun, phrasal verb..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
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

      {/* Import CSV Modal */}
      {showImportCsv && (
        <ImportCsvModal
          deckId={deck._id}
          deckTitle={deck.title}
          isOpen={showImportCsv}
          onClose={() => setShowImportCsv(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
};
