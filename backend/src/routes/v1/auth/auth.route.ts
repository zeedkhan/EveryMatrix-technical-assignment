import { Request, Response, Router } from 'express';
import validate from '../../../middleware/validate.js';
import prisma from '../../../../prisma/prisma.js'
import { createUserSchema, loginSchema } from '../../../validations/auth.validation.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { login, logout, refreshToken, reloadAuth, verifyToken } from '../../../controller/auth.controller.js';


dotenv.config();

const authRouter = Router();

// get all users
authRouter.get('/user', async (req: Request, res: Response) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers).status(200);
});

authRouter.post('/login', validate(loginSchema), login);

authRouter.post('/logout', logout);

authRouter.post('/session', verifyToken);

authRouter.get('/refresh', refreshToken);

authRouter.post('/hard-refresh', reloadAuth)

// get a user
authRouter.get('/user/:id', async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).send('User ID is required');
    };

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            chatRooms: {
                include: {
                    messages: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                    },
                    users: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
        },
    });

    if (!user) {
        return res.status(404).send('User not found');
    };

    res.json(user).status(200);
});

// create a user
authRouter.post('/signup', validate(createUserSchema), async (req: Request, res: Response) => {

    const { name, email, password }: {
        name: string,
        email: string,
        password: string
    } = req.body;

    // check if user exists
    const userExists = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (userExists) {
        console.log("Sign up - User exists");
        return res.status(400).send({ error: 'User already exists' });
    };

    // encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10);

    const response = await prisma.user.create({
        data: {
            name,
            email,
            password: encryptedPassword
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    res.json(response).status(201);
});

export default authRouter