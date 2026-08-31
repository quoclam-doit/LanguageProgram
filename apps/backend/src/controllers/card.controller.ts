import { Request, Response } from 'express';
import { z } from 'zod';
import { Card } from '../models/Card';
import { Deck } from '../models/Deck';
import { UserCardState } from '../models/UserCardState';

const createCardSchema = z.object({
  term: z.string().min(1, 'Từ vựng không được để trống'),
  ipa: z.object({ us: z.string().optional(), uk: z.string().optional() }).optional(),
  meanings: z.array(z.object({ langCode: z.string(), text: z.string() })).min(1, 'Phải có ít nhất 1 nghĩa tiếng Việt'),
  examples: z.array(z.object({ en: z.string(), vi: z.string().optional() })).optional().default([]),
  audioUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

const updateCardSchema = createCardSchema.partial();

export const cardController = {
  // GET /api/decks/:deckId/cards
  async getCardsByDeck(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      const cards = await Card.find({ deckId }).sort({ createdAt: 1 });

      res.status(200).json({ success: true, data: cards });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/decks/:deckId/cards
  async createCard(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      const parsed = createCardSchema.parse(req.body);

      const deck = await Deck.findById(deckId);
      if (!deck) {
        res.status(404).json({ success: false, error: 'Không tìm thấy bộ thẻ' });
        return;
      }

      const newCard = await Card.create({
        ...parsed,
        deckId,
        langCode: deck.langCode || 'en',
      });

      // Increment cardCount in deck
      deck.cardCount = (deck.cardCount || 0) + 1;
      await deck.save();

      res.status(201).json({ success: true, data: newCard });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /api/cards/:id
  async updateCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = updateCardSchema.parse(req.body);

      const card = await Card.findByIdAndUpdate(id, parsed, { new: true });
      if (!card) {
        res.status(404).json({ success: false, error: 'Không tìm thấy thẻ từ vựng' });
        return;
      }

      res.status(200).json({ success: true, data: card });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // DELETE /api/cards/:id
  async deleteCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const card = await Card.findByIdAndDelete(id);

      if (!card) {
        res.status(404).json({ success: false, error: 'Không tìm thấy thẻ từ vựng' });
        return;
      }

      // Decrement deck cardCount
      await Deck.findByIdAndUpdate(card.deckId, { $inc: { cardCount: -1 } });
      await UserCardState.deleteMany({ cardId: id });

      res.status(200).json({ success: true, message: 'Đã xóa thẻ từ vựng thành công' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
