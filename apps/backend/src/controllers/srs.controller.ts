import { Request, Response } from 'express';
import { z } from 'zod';
import { Card } from '../models/Card';
import { UserCardState } from '../models/UserCardState';
import { ReviewLog } from '../models/ReviewLog';
import { User } from '../models/User';
import { calculateNextFSRSState } from '../services/fsrs.service';

const reviewCardSchema = z.object({
  cardId: z.string().min(1),
  deckId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const srsController = {
  // GET /api/srs/due?deckId=...
  async getDueCards(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const { deckId } = req.query;

      if (!deckId) {
        res.status(400).json({ success: false, error: 'Thiếu deckId' });
        return;
      }

      const now = new Date();

      // Find all cards in deck
      const cards = await Card.find({ deckId });
      const cardIds = cards.map((c) => c._id);

      // Find existing states for these cards by this user
      const states = await UserCardState.find({
        userId,
        cardId: { $in: cardIds },
      });

      const stateMap = new Map(states.map((s) => [s.cardId.toString(), s]));

      // Filter due cards: either never learned (no state record) or due <= now
      const dueItems = cards
        .map((card) => {
          const state = stateMap.get(card._id.toString());
          const isDue = !state || state.due <= now || state.state === 'new';
          return { card, state, isDue };
        })
        .filter((item) => item.isDue);

      const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const finalDueItems = limitParam > 0 ? dueItems.slice(0, limitParam) : dueItems;

      res.status(200).json({
        success: true,
        data: finalDueItems.map((item) => ({
          card: item.card,
          userState: item.state || {
            state: 'new',
            stability: 0,
            difficulty: 0,
            reps: 0,
            lapses: 0,
            due: now,
          },
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/srs/review
  async reviewCard(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id;
      const parsed = reviewCardSchema.parse(req.body);
      const now = new Date();

      // Find or create UserCardState
      let userState = await UserCardState.findOne({
        userId,
        cardId: parsed.cardId,
      });

      const stateBefore = userState ? userState.state : 'new';

      if (!userState) {
        userState = new UserCardState({
          userId,
          cardId: parsed.cardId,
          deckId: parsed.deckId,
          state: 'new',
          stability: 0,
          difficulty: 0,
          elapsedDays: 0,
          scheduledDays: 0,
          reps: 0,
          lapses: 0,
          due: now,
        });
      }

      // Calculate next FSRS state
      const nextFsrs = calculateNextFSRSState(userState, parsed.rating, now);

      // Update UserCardState
      userState.state = nextFsrs.state;
      userState.stability = nextFsrs.stability;
      userState.difficulty = nextFsrs.difficulty;
      userState.elapsedDays = nextFsrs.elapsedDays;
      userState.scheduledDays = nextFsrs.scheduledDays;
      userState.reps = nextFsrs.reps;
      userState.lapses = nextFsrs.lapses;
      userState.due = nextFsrs.due;
      userState.lastReview = nextFsrs.lastReview;

      await userState.save();

      // Write append-only ReviewLog
      await ReviewLog.create({
        userId,
        cardId: parsed.cardId,
        rating: parsed.rating,
        stateBefore,
        stateAfter: nextFsrs.state,
        reviewedAt: now,
      });

      // Update User XP & Streak (+10 XP per card review)
      const user = await User.findById(userId);
      let xpEarned = 10;

      if (user) {
        user.xp = (user.xp || 0) + xpEarned;

        // Check Streak calculation (YYYY-MM-DD in user timezone)
        const tz = user.timezone || 'Asia/Ho_Chi_Minh';
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now);

        if (!user.streak) {
          user.streak = { current: 1, lastLearnedDate: todayStr };
        } else {
          const lastDate = user.streak.lastLearnedDate;
          if (lastDate !== todayStr) {
            // Check if yesterday
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(yesterday);

            if (lastDate === yesterdayStr) {
              user.streak.current += 1;
            } else {
              user.streak.current = 1;
            }
            user.streak.lastLearnedDate = todayStr;
          }
        }

        await user.save();
      }

      res.status(200).json({
        success: true,
        data: {
          nextState: userState,
          xpEarned,
          totalXp: user?.xp || 0,
          currentStreak: user?.streak?.current || 1,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
