import {PrismaClient} from '@prisma/client';
import Hash from "../services/hash";
import jwt from "../services/jwt";
import { Request, Response, NextFunction } from "express";
import HashService from "../services/hash";

const prisma = new PrismaClient({
    log:['query'],
});


class userController {
    public static getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const { value: pagination } = PaginationValidator.paginationSchema.validate(req.query);

            const result = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            res.status(200).json({
                message: "Users retrieved successfully",
                data: result,
            });
        } catch (error) {
            console.error("UserController - getAllUsers", error);
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

    public static getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id;

            if (!userId) {
                return next({
                    status: 400,
                    message: "Admin id is missing in the params",
                    error: {
                        code: "VALIDATION_ERROR",
                        details: "admin Id is missing",
                    },
                });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                return next({
                    status: 404,
                    message: "User not found",
                    error: {
                        code: "NOT_FOUND",
                        details: "No user found with the provided ID",
                    },
                });
            }

            res.status(200).json({
                message: "User Retrieved successfully",
                data: user,
            });
        } catch (error) {
            console.error("UserController - getUserById", error);
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

    public static createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const { error, value } = UserValidator.createUser.validate(req.body);
            const value = req.body;

            const newUser = await prisma.user.create({
                data: {
                    username: value.username,
                    email: value.email,
                    password: HashService.hash(value.password, 12),
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            res.status(201).json({
                message: "User Created successfully",
                data: newUser,
            });
        } catch (error) {
            console.log("UserController.CreateUser", error);
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

    public static updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const value = req.body;
            const userId = req.params.id;

            const updatedUser = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    ...(value.username ? { username: value.username } : {}),
                    ...(value.email ? { email: value.email } : {}),
                    ...(value.password ? { password: HashService.hash(value.password, 12) } : {}),
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true ,
                },
            });

            res.status(200).json({
                message: "User Updated successfully",
                data: updatedUser,
            });
        } catch (error) {
            console.log("UserController - UpdateUser", error);
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

export default userController;