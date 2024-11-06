
import express from 'express';
import { auth, adminOnly } from '../middleware/auth';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController';

const router = express.Router();

// כל הנתיבים דורשים הרשאת מנהל
router.use(auth, adminOnly);

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
