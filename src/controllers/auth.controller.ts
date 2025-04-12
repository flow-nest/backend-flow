// import { Request, Response, NextFunction } from "express";
import {PrismaClient} from '@prisma/client';
import Hash from "../services/hash";
import jwt from "../services/jwt";
// import TokenService from "../services/token.service";

const prisma = new PrismaClient({
    log:['query'],
});

class AuthController {
    public static async signup(req:any, res : any, next: any) {
        try {
            const { username, email, password } = req.body;
            console.log("body data:", username, email, password);
            // Validate input
            if (!email || !password || !username) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                    error: {
                        code: "MISSING_FIELDS",
                        details: "Username, email, and password are required"
                    }
                });
            }
    
            // Check if user already exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                }
            });
    
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists",
                    error: {
                        code: "USER_EXISTS",
                        details: existingUser.email === email ? "Email already in use" : "Username already taken"
                    }
                });
            }
    
            // Hash the password
            const hashedPassword = Hash.hash(password);
    
            // Create a new user
            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    role: "ADMIN",
                    password: hashedPassword,
                }
            });
    
            // Remove password from user object
            const userWithoutPassword = { ...newUser };
            const { password: _, ...userResponse } = userWithoutPassword;
    
            // Generate tokens
            const accessToken = jwt.generateToken(userResponse, "1d");
            const refreshToken = jwt.generateToken(userResponse, "7d");
    
            // Send successful response
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken
                }
            });
        } catch (err) {
            console.error("AuthController - signup: ", err);
            return next({
                success: false,
                message: "Registration failed",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    details: err instanceof Error ? err.message : "Unknown error"
                }
            });
        }
    }

    public static async login(req: any, res: any, next: any) {
        try {
            const { email, password } = req.body;
            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    password: true,
                    createdAt: true,
                }
            });
    
            // Check if user exists
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: {
                        code: "INVALID_CREDENTIALS_EMAIL",
                        details: "The provided email does not exist"
                    }
                });
            }
    
            // Verify password
            const isPasswordMatch = Hash.compare(password, user.password);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    error: {
                        code: "INVALID_CREDENTIALS_PASSWORD",
                        details: "The provided password is incorrect"
                    }
                });
            }
    
            // Remove password from user object
            const { password: _, ...userWithoutPassword } = user;
    
            // Generate tokens
            const accessToken = jwt.generateToken(userWithoutPassword,user.role,  "1d");
            const refreshToken = jwt.generateToken(userWithoutPassword,user.role,  "7d");
    
            
            // Send successful response
            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: {
                    user: userWithoutPassword,
                    accessToken,
                    refreshToken
                }
            });
        } catch (err) {
            console.error("UserController - login: ", err);
            return next({
                status: 500,
                message: "Internal Server Error",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    details: "Internal Server Error",
                },
            });
        }
    }
    public static checkRefreshToken = async (req: any, res: any, next: any) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "").trim();

            if (!token) {
                return next({
                    status: 400,
                    message: "Authorization header is missing or malformed",
                    error: {
                        code: "INVALID_REFRESH_HEADER",
                        details: "Expected format: Bearer <refresh_token>",
                    },
                });
            }

            const tokenData = jwt.verifyToken(token);

            if (!tokenData) {
                return next({
                    status: 401,
                    message: "Invalid or expired refresh token",
                    error: {
                        code: "INVALID_REFRESH_TOKEN",
                        details: "The refresh token is invalid or expired",
                    },
                });
            }

            delete tokenData.systemRole

            const accessToken = jwt.generateToken(tokenData, "1d");
            const refreshToken = jwt.generateToken(tokenData, "7d");

            res.status(200).json({
                message: "Token refreshed successfully",
                data: {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
            });
        } catch (err) {
            console.error("AuthController - checkRefreshToken: ", err);
            return next({
                status: 500,
                message: "Internal Server Error",
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    details: "Internal Server Error",
                },
            });
        }
    };
}

export default AuthController;