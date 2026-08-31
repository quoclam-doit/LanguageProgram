import { Router } from 'express';
import { cardController } from '../controllers/card.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/deck/:deckId', cardController.getCardsByDeck);
router.post('/deck/:deckId', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

export default router;
