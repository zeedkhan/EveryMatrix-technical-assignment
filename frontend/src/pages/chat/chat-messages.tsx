// import { useEffect, useRef, useState } from "react";


// type MessageTypes = "texst" | "file"


// interface Message {
//     id :       string       
//     content:    string
//     type:       MessageTypes
//     createdAt:  DateTime    
//     updatedAt:  DateTime    
//     user:       User        
//     userId:     string
//     chatRoom:   ChatRoom    
//     chatRoomId: string

//     // one message can send multiple files
//     file File[]

//     // isdeleted
//     isDeleted Boolean @default(false)
// }



const ChatMessages = () => {
    // const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    // const [messages, setMessages] = useState<Message[]>([]);
    // useEffect(() => {
    //     if (messagesContainerRef.current) {
    //         messagesContainerRef.current.scrollTop =
    //             messagesContainerRef.current.scrollHeight;
    //     }
    // }, [messages]);

    return (
        <div>
            Messages
        </div>
    )
}

export default ChatMessages;