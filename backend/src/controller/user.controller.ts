import { Request, Response } from "express";
import prisma from "../../prisma/prisma.js";

export const updateAvatar = async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { storePath } = req.body;

    const updateUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            avatar: storePath
        }
    });

    console.log(updateUser)

    res.send(updateUser).status(201);
}

export const getUsersByIds = async (req: Request, res: Response) => {
    const { userIds } = req.body;

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: userIds
            },
        },
        select: {
            id: true,
            name: true,
            avatar: true
        }
    });

    res.json(users).status(200);
}