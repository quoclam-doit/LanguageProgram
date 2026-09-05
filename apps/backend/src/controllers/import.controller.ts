import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import { ImportJob } from '../models/ImportJob';
import { createCardSchema } from './card.controller';
import { processImportJob } from '../services/importWorker.service';

export const importController = {
  // POST /api/decks/:deckId/import-csv
  async importCsv(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { deckId } = req.params;

      const deck = await Deck.findOne({ _id: deckId, ownerId: userId });
      if (!deck) {
        res.status(404).json({ success: false, error: 'Không tìm thấy bộ thẻ hoặc không có quyền import' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, error: 'Thiếu file CSV' });
        return;
      }

      let rawRows: Record<string, string>[];
      try {
        rawRows = parse(req.file.buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } catch (parseErr: any) {
        res.status(400).json({ success: false, error: `File CSV không hợp lệ: ${parseErr.message}` });
        return;
      }

      if (rawRows.length === 0) {
        res.status(400).json({ success: false, error: 'File CSV không có dữ liệu' });
        return;
      }

      // Flexible column normalization (supports partOfSpeech, partofspeech, part_of_speech, meaning, meaningVi, etc.)
      const normalizedRows = rawRows.map((r) => {
        const norm: Record<string, string> = {};
        for (const [key, val] of Object.entries(r)) {
          const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          norm[cleanKey] = val;
        }
        return norm;
      });

      const firstRow = normalizedRows[0];
      const hasTerm = 'term' in firstRow;
      const hasMeaning = 'meaning' in firstRow || 'meaningvi' in firstRow;
      const hasPartOfSpeech = 'partofspeech' in firstRow || 'pos' in firstRow;

      const missingColumns: string[] = [];
      if (!hasTerm) missingColumns.push('term');
      if (!hasPartOfSpeech) missingColumns.push('partOfSpeech');
      if (!hasMeaning) missingColumns.push('meaning');

      if (missingColumns.length > 0) {
        res.status(400).json({
          success: false,
          error: `File CSV thiếu cột bắt buộc: ${missingColumns.join(', ')}`,
        });
        return;
      }

      const rowErrors: string[] = [];
      const cardIds: unknown[] = [];
      let cardsCreated = 0;

      for (let i = 0; i < normalizedRows.length; i++) {
        const row = normalizedRows[i];
        const termVal = row['term']?.trim();
        const meaningVal = (row['meaning'] || row['meaningvi'])?.trim();
        const posVal = (row['partofspeech'] || row['pos'])?.trim();
        const exEnVal = (row['exampleen'] || row['example'])?.trim();
        const exViVal = (row['examplevi'])?.trim();

        const payload = {
          term: termVal,
          meanings: [
            {
              langCode: 'vi',
              text: meaningVal,
              partOfSpeech: posVal,
            },
          ],
          examples: exEnVal ? [{ en: exEnVal, vi: exViVal }] : [],
        };

        const parsed = createCardSchema.safeParse(payload);
        if (!parsed.success) {
          rowErrors.push(`Dòng ${i + 2}: ${parsed.error.errors[0].message}`);
          continue;
        }

        try {
          const card = await Card.create({
            ...parsed.data,
            deckId: deck._id,
            langCode: deck.langCode || 'en',
          });
          cardsCreated += 1;
          cardIds.push(card._id);
        } catch (err: any) {
          rowErrors.push(`Dòng ${i + 2}: ${err.message}`);
        }
      }

      deck.cardCount = (deck.cardCount || 0) + cardsCreated;
      await deck.save();

      const job = await ImportJob.create({
        deckId: deck._id,
        ownerId: userId,
        cardIds,
        status: 'pending',
        totalRows: rawRows.length,
        processedRows: rowErrors.length,
        rowErrors,
      });

      processImportJob(job._id.toString()).catch((err) => {
        console.error('[Import Worker Error]:', err);
      });

      res.status(202).json({
        success: true,
        data: {
          jobId: job._id,
          status: job.status,
          totalRows: job.totalRows,
          processedRows: job.processedRows,
          cardsCreated,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/decks/:deckId/import-jobs/:jobId
  async getImportJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { deckId, jobId } = req.params;

      const job = await ImportJob.findOne({ _id: jobId, deckId, ownerId: userId });
      if (!job) {
        res.status(404).json({ success: false, error: 'Không tìm thấy tiến trình import' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          jobId: job._id,
          status: job.status,
          totalRows: job.totalRows,
          processedRows: job.processedRows,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
