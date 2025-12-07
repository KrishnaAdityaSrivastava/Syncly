import { Router  } from "express";
import { sendOtp, verifyOtp } from "../controllers/email-verification.controller.js";

const emailVerifyRouter = Router();

emailVerifyRouter.post('/send-otp', sendOtp);
emailVerifyRouter.post('/verify-otp', verifyOtp);

export default emailVerifyRouter;