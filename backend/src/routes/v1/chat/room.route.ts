import { Request, Response, Router } from 'express';
import validate from '../../../middleware/validate.js';
import { createMessageSchema, createRoomSchema, updateRoomAvatarSchema, updateRoomSchema } from '../../../validations/room.validation.js';
import prisma from '../../../../prisma/prisma.js'

const chatRouter = Router();

chatRouter.get('/', async (req, res) => {
    const rooms = await prisma.chatRoom.findMany({
        include: {
            users: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
    res.send(rooms).status(200);
});

// get user rooms
chatRouter.get('/user/:id', async (req: Request, res: Response) => {
    const userId = req.params.id;

    const rooms = await prisma.chatRoom.findMany({
        where: {
            users: {
                some: {
                    id: userId
                }
            }
        }
    });

    res.send(rooms).status(200);
});

chatRouter.get('/:id', async (req: Request, res: Response) => {
    const roomId = req.params.id;

    // find a room, check is user is in the room
    const room = await prisma.chatRoom.findUnique({
        where: {
            id: roomId
        },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            },
            messages: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    },
                    file: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    if (!room) {
        return res.status(404).send('Room not found');
    };


    res.json(room).status(200);
});

// create a room
chatRouter.post('/', validate(createRoomSchema), async (req: Request, res: Response) => {
    const { name, userId }: {
        name: string,
        userId: string
    } = req.body;

    const response = await prisma.chatRoom.create({
        data: {
            name,
            users: {
                connect: {
                    id: userId
                }
            }
        },
        include: {
            users: true
        }
    });


    res.send(response).status(201);
});

/*
    When a user send meesage to a room, we need to update the room's updatedAt field
    so we can know the last time a message was sent to the room
*/
chatRouter.post('/:id/message', validate(createMessageSchema), async (req: Request, res: Response) => {
    const { type, text, userId, chatRoomId }: {
        type: "TEXT" | "FILE",
        text: string,
        userId: string
        chatRoomId: string
    } = req.body;

    const response = await prisma.message.create({
        data: {
            type: type,
            text: text,
            userId: userId,
            chatRoomId: chatRoomId,
        }
    });

    // update the room;
    const updateRoom = await prisma.chatRoom.update({
        where: {
            id: chatRoomId
        },
        data: {
            updatedAt: new Date(),
        }
    });

    res.send(response).status(201);
});

// update room avatar
chatRouter.put('/avatar/:id', validate(updateRoomAvatarSchema), async (req: Request, res: Response) => {
    const { storePath }: {
        storePath: string
    } = req.body;
    try {
        const { id } = req.params;

        const response = await prisma.chatRoom.update({
            where: {
                id
            },
            data: {
                avatar: storePath
            }
        });
        res.json(response).status(200);

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

chatRouter.put('/:id', validate(updateRoomSchema), async (req: Request, res: Response) => {
    const { name }: {
        name: string
    } = req.body;

    const { id } = req.params;

    const response = await prisma.chatRoom.update({
        where: {
            id
        },
        data: {
            name
        }
    });

    res.json(response).status(200);
})

// remove user from room
chatRouter.delete('/:id/user/:userId', async (req, res) => {
    const { id, userId } = req.params;

    await prisma.chatRoom.update({
        where: {
            id
        },
        data: {
            users: {
                disconnect: {
                    id: userId
                }
            }
        }
    });

    res.send('Remove User from Room');
});

// delete a message by id
// chatRouter.delete('/:msgId', async (req, res) => {
//     const { msgId } = req.params;
//     await prisma.message.update({
//         where: {
//             id: msgId,
//         },
//         data: {
//             isDeleted: true
//         }
//     });

//     res.send('Delete Message');
// });

export default chatRouter