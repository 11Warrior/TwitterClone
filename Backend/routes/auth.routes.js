import express from 'express'
import { signUp, logIn, logOut, getAuthUser } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router()

router.get('/getAuthUser', protectRoute,getAuthUser)
router.post('/signup', signUp);
router.post('/login',logIn);
router.post('/logout', logOut);


export default router