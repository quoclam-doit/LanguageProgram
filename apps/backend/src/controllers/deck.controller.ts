import { Request, Response } from 'express';
import { z } from 'zod';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import { UserCardState } from '../models/UserCardState';

const createDeckSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional().default(''),
  langCode: z.string().optional().default('en'),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

const updateDeckSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  langCode: z.string().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const deckController = {
  // GET /api/decks
  async getDecks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const decks = await Deck.find({
        $or: [
          { ownerId: userId },
          { isPublic: true, status: 'approved' },
        ],
      }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: decks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/decks/:id
  async getDeckById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deck = await Deck.findById(id);

      if (!deck) {
        res.status(404).json({ success: false, error: 'Không tìm thấy bộ thẻ' });
        return;
      }

      res.status(200).json({ success: true, data: deck });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/decks
  async createDeck(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const parsed = createDeckSchema.parse(req.body);

      const newDeck = await Deck.create({
        ...parsed,
        ownerId: userId,
        status: parsed.isPublic ? 'approved' : 'draft',
        cardCount: 0,
      });

      res.status(201).json({ success: true, data: newDeck });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /api/decks/:id
  async updateDeck(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { id } = req.params;
      const parsed = updateDeckSchema.parse(req.body);

      const deck = await Deck.findOne({ _id: id, ownerId: userId });
      if (!deck) {
        res.status(404).json({ success: false, error: 'Không tìm thấy bộ thẻ hoặc không có quyền chỉnh sửa' });
        return;
      }

      Object.assign(deck, parsed);
      await deck.save();

      res.status(200).json({ success: true, data: deck });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/decks/:id
  async deleteDeck(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { id } = req.params;

      const deck = await Deck.findOneAndDelete({ _id: id, ownerId: userId });
      if (!deck) {
        res.status(404).json({ success: false, error: 'Không tìm thấy bộ thẻ hoặc không có quyền xóa' });
        return;
      }

      // Cascade delete cards & user card states
      await Card.deleteMany({ deckId: id });
      await UserCardState.deleteMany({ deckId: id });

      res.status(200).json({ success: true, message: 'Đã xóa bộ thẻ thành công' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
