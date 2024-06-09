import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Room } from '../../../typings';
import { axiosPrivate } from '@/api/axios';
import useAuth from '@/hooks/use-auth';
import RoomStore from '@/state/room';
import useSocket from '@/hooks/socket-io';
import { v4 as uuidv4 } from 'uuid';
import { ChatList } from './chat-list';
import { cn } from '@/lib/utils';
import UseWindowSize from '@/hooks/use-window-size';
import EditRoomModal from '@/components/shared/edit-room-modal';
import TimeAgo from 'react-timeago'
import { EmojiPicker } from '@/components/shared/emoji-picker';
import Gifs from '@/components/shared/gifs';
import UploadImageMessageModal from '@/components/shared/upload-img-message-modal';
import UploadFileMessageModal from '@/components/shared/upload-file-message-modal';
import { backendURL, dumpAvatar } from '@/config';


const ChatContent = () => {
    const [text, setText] = useState("");
    const { auth } = useAuth();
    const { setRoom, addMessage, currentChat } = RoomStore();
    const socket = useSocket();
    const { isMobile } = UseWindowSize();

    const [roomContext, setRoomContext] = useState<Room | null>(null);

    const [activeUsers, setActiveUsers] = useState<{
        id?: string;
        name?: string;
        avatar?: string;
        socket: string;
        userId: string;
    }[]>([]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text || !currentChat) return;

        setText("");

        socket.emit("message", {
            id: uuidv4(),
            chatRoomId: currentChat?.id,
            text: text,
            type: "TEXT",
            userId: auth?.user.id as string,
            createdAt: new Date().toISOString()
        });
    };


    useEffect(() => {

        if (currentChat) {

            const getMessages = async () => {
                const req = await axiosPrivate.get(`/api/v1/room/${currentChat.id}/`);
                setRoom(req.data);
                setRoomContext(req.data)
            };

            getMessages();

            socket.emit("joinRoom", {
                chatRoomId: currentChat.id,
                time: new Date().toISOString(),
                socketWithUser: {
                    socket: socket.id as string,
                    userId: auth?.user.id as string
                }
            });

            socket.on("userJoinRoom", (data) => {
                setActiveUsers(data.users);
            });

            socket.on("userDisconnect", (data) => {
                console.log("activeUsers", activeUsers)
                if (!activeUsers) return console.log("No room active users");
                const newUsers = activeUsers.filter((i) => i.socket !== data.socketWithUser.socket);
                setActiveUsers(newUsers);
            })

            socket.on("receiveMessage", (data) => {
                console.log("receiveMessage", data);
                addMessage(data.chatRoomId, data);
            });

            // socket.on("error", (data) => {
            //     // setError(data.msg);
            // });

            return () => {
                socket.emit("leaveRoom", { room: currentChat.id })
                socket.off("userJoinRoom");
                socket.off("userDisconnect");
                socket.off("receiveMessage");
                socket.off("error");
            }
        }

    }, [currentChat, socket]);

    useEffect(() => {
        if (!activeUsers || currentChat) {
            console.log("No active users");
            return;
        }
        const updateActiveUsers = async () => {
            const allUsersIds = activeUsers.map((user) => user.userId);
            const req = await axiosPrivate.put("/user/get/users", {
                users: allUsersIds
            });
            const mapResponse = req.data.map((user: {
                id: string;
                name: string;
                avatar: string;
            }) => {
                const userIndex = activeUsers.findIndex((u) => u.userId === user.id);
                if (userIndex !== -1) {
                    return {
                        ...user,
                        ...activeUsers[userIndex],
                    }
                }
                return user;
            });

            setActiveUsers(mapResponse);
        }

        updateActiveUsers();

    }, []);


    return (
        <div className="flex-1 border-l flex">
            <div className='flex-1 h-full relative'>
                {/* Header */}
                <div className="h-[64px] absolute top-0 w-full border-b shadow-sm">
                    <div className='h-full py-2 px-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex space-x-4 items-center'>
                                <Avatar className='w-[40px] h-[40px]'>
                                    <AvatarImage
                                        src={currentChat?.avatar ? backendURL + currentChat.avatar : dumpAvatar}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>

                                <div className='flex flex-col '>
                                    <span>{currentChat?.name}</span>
                                    {currentChat && (
                                        <span>
                                            <TimeAgo date={currentChat?.updatedAt} />
                                        </span>
                                    )}
                                </div>
                            </div>

                            <EditRoomModal />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {!currentChat && (
                    <div>
                        <h2 className="pt-16 text-bold text-2xl">Select a chat to start</h2>
                    </div>
                )}

                {!!currentChat && (
                    <ChatList messages={roomContext?.messages} />
                )}


                {/* Input */}
                {currentChat && (
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full h-20 space-x-4 py-4 px-4 absolute bottom-0 left-0 border-t"
                    >
                        {!text && (
                            <div className='m-auto flex flex-row space-x-3'>

                                <UploadFileMessageModal />

                                <UploadImageMessageModal />


                            </div>
                        )}

                        {!!text && (
                            <EmojiPicker
                                onChange={(value) => {
                                    setText(text + value)
                                }}
                            />
                        )}

                        <Gifs />

                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className='w-full rounded-xl bg-gray-50 border p-4'
                            placeholder='Send a message'
                        />

                        {!!text && (
                            <div className='m-auto'>
                                <Send size={18} />
                            </div>
                        )}

                    </form>
                )}
            </div>



            {!isMobile && (
                <div className='w-1/4 max-w-[380px] border-l flex flex-col pt-8 overflow-hidden overflow-y-auto'>
                    {!currentChat ? (
                        <>
                            <div className='space-y-4 flex flex-col items-center'>
                                <Avatar className='w-[80px] h-[80px]'>
                                    <AvatarImage src={dumpAvatar} width={80} height={80} className="rounded-full" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <p className='font-semibold'>{"Select a chat to start conversion"}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='space-y-4 flex flex-col items-center'>
                                <Avatar className='w-[80px] h-[80px]'>
                                    <AvatarImage src={dumpAvatar} width={80} height={80} className="rounded-full" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <p className='font-semibold'>{currentChat.name}</p>
                            </div>
                            <div className='flex flex-col px-4 pt-8'>
                                <p className='pb-4'>Users</p>

                                {!!roomContext && roomContext.users.length > 0 &&
                                    roomContext.users.map((user) => (
                                        <div key={user.id} className='flex items-center justify-between py-1'>
                                            <div className='flex items-center space-x-4'>
                                                <Avatar className='w-[36px] h-[36px]'>
                                                    <AvatarImage
                                                        src={user.avatar ? backendURL + user.avatar : dumpAvatar}
                                                        width={36}
                                                        height={36}
                                                        className="rounded-full"
                                                    />
                                                    <AvatarFallback>CN</AvatarFallback>
                                                </Avatar>
                                                <p>{user.name}</p>
                                            </div>
                                            <div className={cn(
                                                "w-4 h-4 rounded-full",
                                                "bg-gray-500",
                                                activeUsers.map(i => i.userId).includes(user.id) ? "bg-green-500" : "bg-gray-500",
                                            )} />
                                        </div>
                                    ))
                                }


                            </div>
                        </>
                    )}


                </div >
            )}
        </div >
    );
}

export default ChatContent;