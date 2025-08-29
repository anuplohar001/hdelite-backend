// routes/auth.ts
import express, { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper function to create response with token
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

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { name, email, password, dateOfBirth } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
        });

        await user.save();

        // Return user data with token
        const response = createTokenResponse(user);

        res.status(201).json(response);
    } catch (error: any) {
        console.error('Signup error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }

        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});

// @route   POST /api/auth/signin
// @desc    Sign in user
// @access  Public
router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Return user data with token
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

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
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

export default router;