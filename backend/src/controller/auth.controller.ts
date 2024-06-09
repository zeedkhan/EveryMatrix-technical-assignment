import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from '../../prisma/prisma.js'
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

interface UserSession {
    email: string | null;
    avatar: string | null;
    id: string;
    name: string;
    password: string;
}

const generateAccessToken = (user: UserSession) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
    },
        process.env.ACCESS_TOKEN as string,
        {
            expiresIn: '1min'
        }
    );

    return token
}

const generateRefreshToken = (user: UserSession) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
    },
        process.env.REFRESH_TOKEN as string,
        {
            expiresIn: '7d'
        }
    );

    return token;
}


export const reloadAuth = async (req: Request, res: Response) => {
    const hasCookies = req.cookies.accessToken && req.cookies.refreshToken;
    if (!hasCookies) {
        return res.sendStatus(401);
    }

    const accessToken = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN as string) as UserSession;

    if (!accessToken) {
        return res.sendStatus(401);
    }

    // get user
    const user = await prisma.user.findUnique({
        where: {
            id: accessToken.id
        },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
            avatar: true,
        }
    });

    if (!user) {
        return res.sendStatus(401);
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    })

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    })

    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
}

export const refreshToken = (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.REFRESH_TOKEN as string, (error: any, user: any) => {
        if (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: 'Refresh token has expired, please log in again.' });
            };
            return res.sendStatus(403);
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })


        res.status(200).json({ user: user, accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
}

export const verifyToken = (req: Request, res: Response) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Token not found" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN as string, (error: any, user: any) => {
        if (error) {
            console.log(error.message)
            return res.sendStatus(403);
        }
        res.status(200).json({ user });
    });
};

export const login = async (req: Request, res: Response) => {
    const { email, password }: { email: string; password: string } = req.body;

    // check match password right here
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
            avatar: true,
        }
    });

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    };

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(400).send({ error: 'Invalid credentials' });
    };


    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    })

    // replace with jwt_token
    res.json({
        success: "Credintials matched",
        refreshToken: refreshToken,
        accessToken: token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        }
    }).status(200);
};

export const logout = (req: Request, res: Response) => {
    // @ts-ignore
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: "Logged out" }).status(200);
}