import { Router } from 'express';
import { deckController } from '../controllers/deck.controller';
import { importController } from '../controllers/import.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { csvUpload } from '../middlewares/csvUpload.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', deckController.getDecks);
router.get('/:id', deckController.getDeckById);
router.post('/', deckController.createDeck);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

router.post('/:deckId/import-csv', csvUpload.single('file'), importController.importCsv);
router.get('/:deckId/import-jobs/:jobId', importController.getImportJobStatus);

export default router;
