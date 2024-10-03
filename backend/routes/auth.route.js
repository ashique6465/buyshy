import express from "express"
import { login, logout, signup } from "../controllers/auth.controller.js";
const router = express.Router();

//Sign up
router.get('/signup',signup)


//Login 
router.get('/login',login)

//logout
router.get('/logout',logout)

export default router

// doubpPyY4HlFwCNG
//ertugal37