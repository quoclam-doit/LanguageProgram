import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Cards,
  Plus,
  MagnifyingGlass,
  Trash,
  BookOpen,
} from '@phosphor-icons/react';
import { deckService, DeckData } from '../services/deck.service';
import { useAuth } from '../store/AuthContext';

export const DeckList: React.FC = () => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await deckService.getDecks();
      setDecks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await deckService.createDeck({
        title: newTitle,
        description: newDescription,
        isPublic,
      });
      setNewTitle('');
      setNewDescription('');
      setShowCreateModal(false);
      fetchDecks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDeck = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ thẻ "${title}"?`)) return;
    try {
      await deckService.deleteDeck(id);
      fetchDecks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredDecks = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-[#faf9f6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Title & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600">
              KHO BỘ THẺ THÔNG MINH
            </span>
            <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Quản lý & Khám phá Bộ thẻ từ vựng
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-md active:scale-95"
          >
            <Plus weight="bold" className="h-5 w-5" />
            <span>Tạo Bộ Thẻ Mới</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-2xs">
          <MagnifyingGlass weight="bold" className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bộ thẻ theo tên hoặc mô tả..."
            className="w-full bg-transparent text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Deck Cards Grid */}
        {loading ? (
          <div className="mt-12 text-center text-slate-500 font-medium">Đang tải danh sách bộ thẻ...</div>
        ) : filteredDecks.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white">
            <Cards weight="duotone" className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 font-heading text-lg font-bold text-slate-800">Chưa có bộ thẻ nào</h3>
            <p className="mt-1 text-sm text-slate-500">Bấm nút "Tạo Bộ Thẻ Mới" để bắt đầu tạo từ vựng của bạn.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDecks.map((deck) => {
              const isOwner =
                user &&
                (String(user.id) === String(deck.ownerId) || String((user as any)._id) === String(deck.ownerId));

              return (
                <motion.div
                  key={deck._id}
                  whileHover={{ y: -4 }}
                  className="app-card flex flex-col justify-between rounded-3xl p-6 relative overflow-hidden group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                        {deck.cardCount} Thẻ
                      </span>

                      {isOwner && (
                        <button
                          onClick={() => handleDeleteDeck(deck._id, deck.title)}
                          title="Xóa bộ thẻ"
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash weight="bold" className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <h3 className="mt-4 font-heading text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {deck.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {deck.description || 'Chưa có mô tả'}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-2">
                    <Link
                      to={`/study/${deck._id}`}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold active:scale-95"
                    >
                      <BookOpen weight="bold" className="h-4 w-4" />
                      <span>Học Ngay FSRS</span>
                    </Link>
                    <Link
                      to={`/decks/${deck._id}`}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
                    >
                      Chi Tiết
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Create Deck */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
          >
            <h3 className="font-heading text-xl font-bold text-slate-900">Tạo Bộ Thẻ Mới</h3>
            <form onSubmit={handleCreateDeck} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Tên Bộ Thẻ *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Oxford 3000, TOEIC Business..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Mô Tả</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả mục tiêu bài học..."
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPublic" className="text-xs font-semibold text-slate-700">
                  Công khai bộ thẻ này cho cộng đồng học tập
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary rounded-xl px-5 py-2 text-xs font-bold">
                  Tạo Ngay
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
