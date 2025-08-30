
import express, { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();
let otpStore: Record<string, string> = {};


const createTokenResponse = (user: IUser) => {
    const token = user.generateToken();

    return {
        success: true,
        message: 'User registered successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    };
};


const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}



const sendOtpEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
    });
};



router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { name, email, dateOfBirth, otp } = req.body;


        if (!otp) {
            if (!name || !email || !dateOfBirth) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide name, email, and date of birth',
                });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email',
                });
            }

            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore[email] = generatedOtp;

            await sendOtpEmail(email, generatedOtp);

            return res.status(200).json({
                success: true,
                message: 'OTP sent to your email',
            });
        }


        if (otpStore[email] !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }
        let existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const user = new User({ name, email, dateOfBirth });
        await user.save();

        delete otpStore[email];

        const response = createTokenResponse(user);
        res.status(201).json(response);

    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});



router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;


        if (!otp) {
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email',
                });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore[email] = generatedOtp;

            await sendOtpEmail(email, generatedOtp);

            return res.status(200).json({
                success: true,
                message: 'OTP sent to your email',
            });
        }


        if (otpStore[email] !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        delete otpStore[email];

        const response = createTokenResponse(user);
        res.status(200).json(response);

    } catch (error: any) {
        console.error('Signin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during sign in',
        });
    }
});




router.get('/me', async (req: Request, res: Response) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid',
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({
            success: false,
            message: 'Token is not valid',
        });
    }
});


router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your One Time Password for Highway Delight's Notepad Application",
        text: `Your login OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent" });
});


router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ message: "OTP verified, login success", token: "JWT_TOKEN" });
    }
    return res.status(400).json({ message: "Invalid OTP" });
});




router.post("/resend-otp", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const otp = generateOTP();
        otpStore[email] = otp;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your One Time Password for Highway Delight's Notepad Application",
            text: `Your login OTP is: ${otp}. It will expire in 5 minutes.`,
        });

        return res.json({
            success: true,
            message: "New OTP sent to your email",
        });
    } catch (error: any) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while resending OTP",
        });
    }
});



export default router;