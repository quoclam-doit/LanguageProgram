import { Router } from 'express';
import { dictionaryController } from '../controllers/dictionary.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/lookup', dictionaryController.lookup);

export default router;
