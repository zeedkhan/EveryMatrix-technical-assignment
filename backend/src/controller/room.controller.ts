import { Server, Socket } from "socket.io"
import {
    AddMessageFromServerToClientProps,
    AddMessageToRoomProps,
    ClientToServerEvents,
    ServerToClientEvents,
    UserJoinRoomProps
} from "../../typings.js";
import prisma from "../../prisma/prisma.js";
import { ChatRoom, MessageType } from "@prisma/client";


const createMessage = async ({ text, userId, chatRoomId, type }: {
    text: string,
    userId: string,
    chatRoomId: string
    type: MessageType
}) => {
    // check is user is a member of the room
    const updateUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            chatRooms: {
                connect: {
                    id: chatRoomId
                }
            }
        }
    });

    const msg = await prisma.message.create({
        data: {
            text: text,
            userId: userId,
            chatRoomId: chatRoomId,
            type: type,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    id: true
                }
            }
        }
    });

    const updateRoom = await prisma.chatRoom.update({
        where: {
            id: chatRoomId,
        },
        data: {
            updatedAt: new Date()
        }
    })

    return msg
}

const createMessageFiles = async (
    { text, userId, chatRoomId, type, files }: {
        text: string,
        userId: string,
        chatRoomId: string,
        type: MessageType,
        files: {
            name: string;
            size: number;
            key: string;
            url: string;
        }[]
    }
) => {
    // check is user is a member of the room
    const updateUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            chatRooms: {
                connect: {
                    id: chatRoomId
                }
            }
        }
    });

    const msg = await prisma.message.create({
        data: {
            text: "",
            userId: userId,
            chatRoomId: chatRoomId,
            type: "FILE",
            file: {
                create: files
            }
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    id: true
                }
            },
            file: {
                select: {
                    name: true,
                    size: true,
                    key: true,
                    url: true,
                    createdAt: true
                }
            }
        }
    });


    const updateRoom = await prisma.chatRoom.update({
        where: {
            id: chatRoomId,
        },
        data: {
            updatedAt: new Date()
        }
    })

    return msg
}

type Connection = Socket<
    ClientToServerEvents,
    ServerToClientEvents
>;

interface SocketWithUser {
    socket: string;
    userId: string;
}

class RoomManager {
    chatSocket: Map<string, Map<string, SocketWithUser>>;

    constructor() {
        this.chatSocket = new Map();
    }

    async joinRoom(chatRoomId: string, socketWithUser: { socket: string, userId: string }) {
        const findRoom = await prisma.chatRoom.findUnique({
            where: {
                id: chatRoomId
            },
        });

        if (!findRoom) {
            return null;
        }

        if (!this.chatSocket.has(chatRoomId)) {
            console.log("Create a new room in socket.io")
            this.chatSocket.set(chatRoomId, new Map([[socketWithUser.socket, socketWithUser]]));
        } else {
            console.log("Joining existing room in socket.io")
            const currentRoom = this.chatSocket.get(chatRoomId);
            if (!currentRoom) return null;
            currentRoom.set(socketWithUser.socket, socketWithUser)
        }

        return findRoom;
    }

    getUsersInRoom(roomId: string) {
        const room = this.chatSocket.get(roomId);
        if (!room) return [];
        return room;
    }

    getChatRoomBySocket(socket: string) {
        for (const [key, value] of this.chatSocket) {
            if (value.has(socket)) {
                return {
                    room: key,
                    users: value
                };
            }
        }
        return null;
    }
}


class ManagerController {
    clients: Map<string, Connection>;
    roomManager: RoomManager;
    self: Server;

    constructor(server: Server) {
        this.clients = new Map();
        this.self = server;
        this.roomManager = new RoomManager();
        this.init();
    };

    init() {
        this.self.on("connection", (client: Connection) => {
            this.addClient(client);

            client.on("joinRoom", (data) => this.userJoinRoom(client, data));

            client.on("message", (data) => this.handleMessge(client, data));

            client.on("leaveRoom", (data) => {
                console.log("This is client size", this.clients.size, "clients");
                const socket = this.roomManager.getChatRoomBySocket(client.id);

                if (socket?.room) {
                    client.to(socket.room).emit("userDisconnect", {
                        time: new Date().toISOString(),
                        chatRoomId: socket.room,
                        socketWithUser: {
                            socket: client.id,
                            userId: socket.users.get(client.id)?.userId as string
                        }
                    });

                    socket.users.delete(client.id);
                }
            });

            client.on("disconnect", () => {
                console.log("This is client size", this.clients.size, "clients");
                const socket = this.roomManager.getChatRoomBySocket(client.id);

                if (socket?.room) {
                    client.to(socket.room).emit("userDisconnect", {
                        time: new Date().toISOString(),
                        chatRoomId: socket.room,
                        socketWithUser: {
                            socket: client.id,
                            userId: socket.users.get(client.id)?.userId as string
                        }
                    });

                    socket.users.delete(client.id);
                }

                this.removeClient(client);
            });
        });
    }

    async handleMessge(client: Connection, payload: AddMessageToRoomProps) {
        let msg = null;
        if (payload.type === "FILE" && payload.file) {
            msg = await createMessageFiles({
                text: payload.text,
                userId: payload.userId,
                chatRoomId: payload.chatRoomId,
                type: payload.type,
                files: payload.file
            });
        } else {
            msg = await createMessage({
                text: payload.text,
                userId: payload.userId,
                chatRoomId: payload.chatRoomId,
                type: payload.type
            });
        }

        const newPayload: AddMessageFromServerToClientProps = {
            text: payload.text,
            type: payload.type,
            createdAt: payload.createdAt,
            id: payload.id,
            chatRoomId: payload.chatRoomId,
            userId: payload.userId,
        }

        if (payload.type === "FILE") {
            newPayload.file = payload.file;
        }

        client.emit("receiveMessage", newPayload);

        if (!msg) {
            client.emit("error", {
                msg: "Error adding message"
            });
            return;
        }

        console.log("Adding message", payload);
        client.to(payload.chatRoomId).emit("receiveMessage", newPayload);
    }

    getUsersInRoom(roomId: string, userId: string) {
        return Array.from(this.roomManager.getUsersInRoom(roomId).values());
    }

    joinRoom(client: Connection, payload: UserJoinRoomProps, chatRoom: ChatRoom) {
        const users = this.getUsersInRoom(chatRoom.id, payload.socketWithUser.userId);

        client.join(chatRoom.id);

        // self
        client.emit("userJoinRoom", {
            chatRoomId: chatRoom.id,
            userId: payload.socketWithUser.userId,
            time: new Date().toISOString(),
            users: users
        });

        // others
        client.broadcast.to(chatRoom.id).emit("userJoinRoom", {
            chatRoomId: chatRoom.id,
            userId: payload.socketWithUser.userId,
            time: new Date().toISOString(),
            users: users
        });

    }

    async userJoinRoom(client: Connection, payload: UserJoinRoomProps) {
        const findRoom = await this.roomManager.joinRoom(payload.chatRoomId, {
            socket: payload.socketWithUser.socket,
            userId: payload.socketWithUser.userId
        });
        if (!findRoom) {
            client.emit("error", {
                msg: "Room not found"
            });
            return;
        };

        return this.joinRoom(client, payload, findRoom)
    }

    addClient(client: Socket) {
        if (!this.clients.has(client.id)) {
            console.log("Added client", client.id);
            this.clients.set(client.id, client);
        }
    }

    removeClient(client: Connection) {
        console.log("Remove client", client.id);
        this.clients.delete(client.id);
        return this
    }

}


export {
    ManagerController,
    Connection
}