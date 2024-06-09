interface Room {
    id: string
    name: string
    users: User[]
    messages: Message[]
}

interface Message {
    id: string
    text: string
    user: User
    room: Room
    createdAt: string
}

interface User {
    id: string
    email: string
    name: string
    rooms: Room[]
    password: string
    messages: Message[]
}

interface UserJoinRoomProps {
    socketWithUser: {
        socket: string;
        userId: string;
    }
    chatRoomId: string;
    time: string;
}

interface UserJoinRoomServerProps {
    userId: string;
    chatRoomId: string;
    time: string;
    users: {
        socket: string;
        userId: string;
    }[];
}

interface userDisconnectRoomServerProps {
    socketWithUser: {
        socket: string;
        userId: string;
    }
    chatRoomId: string;
    time: string;
}

interface AddMessageToRoomProps {
    id: string;
    type: "TEXT" | "FILE";
    text: string;
    chatRoomId: string;
    userId: string;
    createdAt: string;

    file?: {
        name: string;
        size: number;
        key: string;
        url: string;
    }[];
}

interface AddMessageFromServerToClientProps {
    text: string;
    type: "TEXT" | "FILE";
    createdAt: string;
    id: string;
    chatRoomId: string;
    userId: string;

    file?: {
        name: string;
        size: number;
        key: string;
        url: string;
    }[];
}


export interface ServerToClientEvents {
    error: (data: { msg: string }) => void;
    userJoinRoom: (data: UserJoinRoomServerProps) => void;
    userDisconnect: (data: userDisconnectRoomServerProps) => void;
    receiveMessage: (data: AddMessageFromServerToClientProps) => void;
}

export interface ClientToServerEvents {
    clientMsg: (data: { msg: string, room: string }) => void;
    leaveRoom: (data: { room: string }) => void;
    connected: () => void;
    joinRoom: (data: UserJoinRoomProps) => void;
    message: (data: AddMessageToRoomProps) => void;
}


export {
    AddMessageFromServerToClientProps,
    UserJoinRoomProps,
    AddMessageToRoomProps,
    UserJoinRoomServerProps
}