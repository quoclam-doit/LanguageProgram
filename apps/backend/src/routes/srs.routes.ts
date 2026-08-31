import { Router } from 'express';
import { srsController } from '../controllers/srs.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/due', srsController.getDueCards);
router.post('/review', srsController.reviewCard);

export default router;
