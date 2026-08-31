import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  State,
  Card as FSRSCard,
  RecordLogItem,
} from 'ts-fsrs';
import { IUserCardStateDocument } from '../models/UserCardState';

// Initialize FSRS instance with default parameters
const f = fsrs(generatorParameters({ enable_fuzz: true }));

export interface FSRSCalculationResult {
  state: 'new' | 'learning' | 'review' | 'relearning';
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  due: Date;
  lastReview: Date;
}

/**
 * Maps rating 1..4 to FSRS Rating enum
 * 1: Again (Forgot)
 * 2: Hard (Recall with effort)
 * 3: Good (Recall easily)
 * 4: Easy (Recall instantly)
 */
export function mapRatingToFSRS(rating: 1 | 2 | 3 | 4): Rating {
  switch (rating) {
    case 1:
      return Rating.Again;
    case 2:
      return Rating.Hard;
    case 3:
      return Rating.Good;
    case 4:
      return Rating.Easy;
    default:
      return Rating.Good;
  }
}

/**
 * Converts String state to FSRS State enum
 */
export function mapStateToFSRS(state: string): State {
  switch (state) {
    case 'new':
      return State.New;
    case 'learning':
      return State.Learning;
    case 'review':
      return State.Review;
    case 'relearning':
      return State.Relearning;
    default:
      return State.New;
  }
}

/**
 * Converts FSRS State enum to String state
 */
export function mapFSRSToState(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  switch (state) {
    case State.New:
      return 'new';
    case State.Learning:
      return 'learning';
    case State.Review:
      return 'review';
    case State.Relearning:
      return 'relearning';
    default:
      return 'learning';
  }
}

/**
 * Calculates next FSRS state and scheduling interval for a user card state
 */
export function calculateNextFSRSState(
  stateDoc: IUserCardStateDocument,
  rating: 1 | 2 | 3 | 4,
  now: Date = new Date()
): FSRSCalculationResult {
  const fsrsRating = mapRatingToFSRS(rating);
  const fsrsState = mapStateToFSRS(stateDoc.state);
  const empty = createEmptyCard(now);

  // Reconstruct FSRS Card object
  const currentFSRSCard: FSRSCard = {
    ...empty,
    due: stateDoc.due ? new Date(stateDoc.due) : now,
    stability: stateDoc.stability || 0,
    difficulty: stateDoc.difficulty || 0,
    elapsed_days: stateDoc.elapsedDays || 0,
    scheduled_days: stateDoc.scheduledDays || 0,
    reps: stateDoc.reps || 0,
    lapses: stateDoc.lapses || 0,
    state: fsrsState,
    last_review: stateDoc.lastReview ? new Date(stateDoc.lastReview) : undefined,
  };

  // Compute next scheduling using FSRS engine
  const schedulingCards = f.repeat(currentFSRSCard, now);
  const resultItem = (schedulingCards as any)[fsrsRating] as RecordLogItem;
  const nextCard = resultItem.card;

  return {
    state: mapFSRSToState(nextCard.state),
    stability: Math.round(nextCard.stability * 100) / 100,
    difficulty: Math.round(nextCard.difficulty * 100) / 100,
    elapsedDays: nextCard.elapsed_days,
    scheduledDays: nextCard.scheduled_days,
    reps: nextCard.reps,
    lapses: nextCard.lapses,
    due: nextCard.due,
    lastReview: now,
  };
}
