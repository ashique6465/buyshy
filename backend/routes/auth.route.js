import express from "express"
import { login, logout, signup,refreshToken } from "../controllers/auth.controller.js";
const router = express.Router();

//Sign up
router.post('/signup',signup)


//Login 
router.post('/login',login)

//logout
router.post('/logout',logout)
router.post('/refresh-token',refreshToken)
// router.get('/profile',getProfile)

export default router

// doubpPyY4HlFwCNG
//ertugal37