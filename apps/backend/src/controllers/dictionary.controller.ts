import { Request, Response } from 'express';
import { lookupPhonetic } from '../services/dictionary.service';

export const dictionaryController = {
  // GET /api/dictionary/lookup?word=...
  async lookup(req: Request, res: Response): Promise<void> {
    try {
      const word = typeof req.query.word === 'string' ? req.query.word : '';
      if (!word.trim()) {
        res.status(400).json({ success: false, error: 'Thiếu từ cần tra' });
        return;
      }

      const result = await lookupPhonetic(word);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
