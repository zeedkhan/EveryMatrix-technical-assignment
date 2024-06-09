import { create } from 'zustand'
import { Room, Message } from '../../typings'
import { axiosPrivate } from '@/api/axios';

interface ChatRoomController {
    rooms: Room[];
    setRooms: (rooms: Room[]) => void;
    createRoom: (userId: string, roomName: string) => Promise<void>;
    setMessages: (roomId: string, messages: Message[]) => void
    setRoom: (room: Room) => void;
    addMessage: (chatRoomId: string, messages: Message) => void;

    currentChat: Room | null;
    setCurrentChat: (chatRoom: Room | null) => void;
}

const RoomStore = create<ChatRoomController>((set) => ({
    rooms: [],
    currentChat: null,

    setRooms: (rooms) => {
        set((prev) => ({ ...prev, rooms: rooms }))
    },
    createRoom: async (userId, roomName) => {
        const res = await axiosPrivate.post(`/api/v1/room`, { userId, name: roomName }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        set((prev) => {
            // Check if prev.rooms is an array, if not, initialize it as an empty array
            const rooms = Array.isArray(prev.rooms) ? prev.rooms : [];
            return { ...prev, rooms: [res.data, ...rooms] };
        });
    },
    setMessages: (roomId, messages) => {
        set((prev) => {
            const room = prev.rooms.find((r) => r.id === roomId);
            if (room) {
                room.messages = messages;
            }
            return { ...prev, rooms: [...prev.rooms] };
        });
    },
    addMessage: (chatRoomId: string, message: Message) => {
        set((prev) => {
            const room = prev.rooms.find((r) => r.id === chatRoomId);
            if (room) {
                room.messages.push(message);
            }
            return { ...prev, rooms: [...prev.rooms] };
        })
    },
    setRoom: (room) => {
        set((prev) => {
            const rooms = prev.rooms.map((r) => {
                if (r.id === room.id) {
                    return room;
                }
                return r;
            });
            return { ...prev, rooms: rooms };
        })
    },

    setCurrentChat: (chatRoom: Room | null) => {
        set({ currentChat: chatRoom });
    }

}));

export default RoomStore;