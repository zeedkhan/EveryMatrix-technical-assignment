import ChatContent from "./chat-content";
import { useEffect } from "react";
import { axiosPrivate } from "@/api/axios";
import useAuth from "@/hooks/use-auth";
import { Room } from '../../../typings'

import RoomStore from "@/state/room";
import DisplayRoom from "./rooms-";
import UseWindowSize from "@/hooks/use-window-size";

const Chat = () => {
    const { auth } = useAuth();

    const { setRooms } = RoomStore();

    const { isMobile, width } = UseWindowSize();

    // get user chats
    useEffect(() => {
        if (auth?.user) {
            const getData = async () => {
                const req = await axiosPrivate.get<Room[]>(`/api/v1/room`);
                setRooms(req.data)
            }

            getData();
        }
    }, []);


    return (
        <main>

            <div className="flex" style={{ height: "calc(100vh - 3.5rem)" }}>
                {!isMobile && width && width > 1000 && (
                    <DisplayRoom />
                )}
                <ChatContent />
            </div>
        </main>
    );
}

export default Chat;