import { Room } from '../../../typings'
import CreateRoomModal from '@/components/shared/create-room-modal';
import { cn } from '@/lib/utils';
import RoomStore from '@/state/room';
import { Lock, UnlockIcon } from 'lucide-react';
import useAuth from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { backendURL, dumpAvatar } from '@/config';


interface DisplayRoomProps {
    extraClasses?: string;
}

const DisplayRoom: React.FC<DisplayRoomProps> = ({
    extraClasses,
}: { extraClasses?: string }) => {

    const { auth } = useAuth();

    const { rooms, setCurrentChat, currentChat } = RoomStore();

    const onClick = (chat: Room) => {
        setCurrentChat(chat);
    };

    return (
        <>
            <div
                className={cn(
                    "w-1/4 max-w-[380px] h-full m-auto overflow-hidden overflow-y-scroll p-2",
                    extraClasses && extraClasses
                )}
            >
                <ul className='pb-4'>
                    <li className={cn(
                        "cursor-pointer bg-gray-50 shadow-xl border h-20",
                        "border-sky-200 p-4 rounded-md",
                        "hover:scale-95 transition-transform duration-50 ease-in-out my-2",
                    )}>
                        <CreateRoomModal />
                    </li>

                    {rooms.map((chat) => (
                        <li
                            onClick={() => onClick(chat)}
                            key={chat.id}
                            className={cn(
                                "cursor-pointer bg-gray-50 shadow-xl border",
                                "border-sky-200 py-1.5 px-4 rounded-md",
                                "hover:scale-95 transition-transform duration-50 ease-in-out my-2",
                                currentChat && currentChat.id === chat.id && "bg-sky-200",
                                "md:py-2"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className='flex items-center space-x-4'>
                                    <Avatar className='w-[40px] h-[40px]'>
                                        <AvatarImage
                                            src={chat?.avatar ? backendURL + chat.avatar : dumpAvatar}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <h3 className='max-w-20 truncate font-semibold'>
                                        {chat.name}
                                    </h3>
                                </div>

                                <div>
                                    {chat.users.some((u) => u.id === auth?.user.id) ? (
                                        <UnlockIcon className='text-green-600 font-bold' />
                                    ) : (
                                        <Lock className='text-red-600 font-bold' />
                                    )}
                                </div>

                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>

    );
}

export default DisplayRoom;