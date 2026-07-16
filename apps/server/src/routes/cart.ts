import { Router } from 'express';
import api from '../../packages/shared/utils/api';

const router = Router();

router.get('/cart', async (req, res) => {
  const response = await api.get('/cart');
  res.json(response.data);
});

export default router;