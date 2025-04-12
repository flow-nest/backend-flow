import AuthController from "../controllers/auth.controller";
import {Router} from 'express';

const router = Router();

// Register route
router.post("/register", AuthController.signup);

// Login route
router.post('/login', AuthController.login);

router.get('/refresh-token', AuthController.checkRefreshToken);

export default router;