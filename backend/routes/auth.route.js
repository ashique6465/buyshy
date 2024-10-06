import express from "express"
import { login, logout, signup } from "../controllers/auth.controller.js";
const router = express.Router();

//Sign up
router.post('/signup',signup)


//Login 
router.post('/login',login)

//logout
router.post('/logout',logout)

export default router

// doubpPyY4HlFwCNG
//ertugal37