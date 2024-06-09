import { Socket, io } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../../typings"
import { useEffect } from "react";
import { backendURL } from "@/config";


const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    backendURL,
    {
        reconnection: true,
        reconnectionDelay: 500,
    }
);

const useSocket = () => {

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected")
        });
        
        socket.on("disconnect", () => {
            console.log("Disconnect")
        });

    }, [socket]);

    return socket;
}

export default useSocket