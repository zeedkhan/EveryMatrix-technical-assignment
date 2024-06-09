import useAuth from "@/hooks/use-auth";
import RoomStore from "@/state/room";
import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "../ui/dialog";
import { Package, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import useSocket from "@/hooks/socket-io";
import { axiosPrivate } from "@/api/axios";
import { v4 as uuidv4 } from 'uuid';

const UploadFileMessageModal = () => {
    const { auth } = useAuth();
    const { currentChat } = RoomStore();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const socket = useSocket();

    const [file, setFile] = useState<File | null>(null);

    const [open, setOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && !file.type.startsWith("image/")) {
            setFile(file);
            setOpen(true);
        } else {
            toast.error("Invalid file type");
        }
    }

    const handleSend = async () => {
        if (!file || !auth?.user || !currentChat?.id || !socket.id) return null;

        try {
            const formData = new FormData();
            formData.append("image", file as Blob);

            const res = await axiosPrivate.post<{ storePath: string }>("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            socket.emit("message", {
                chatRoomId: currentChat.id,
                userId: auth.user.id,
                type: "FILE",
                text: "",
                file: [{
                    name: file?.name || "",
                    size: file?.size || 0,
                    key: res.data.storePath,
                    url: res.data.storePath,

                }],
                createdAt: new Date().toISOString(),
                id: uuidv4()
            });

        } catch (error) {
            toast.error("Failed to send file");
        } finally {
            setOpen(false);
        }

    }


    if (!auth?.user || !currentChat?.id) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <input type="file" hidden id='upload-file' ref={fileRef} onChange={handleFileChange} />
                <Paperclip onClick={() => fileRef.current?.click()} className='cursor-pointer' size={20} />
            </DialogTrigger>
            {file && (
                <DialogContent>
                    <DialogHeader>
                        <p className="font-semibold">Ensure the file before sending.</p>
                    </DialogHeader>
                    <div className="flex flex-col items-center jusitfy-center space-y-2">
                        <Package size={50} />
                        <p>Size: <b>{(file.size / (1024 * 1024)).toFixed(2)} mb.</b></p>
                        <p>Type: <b>{file.type}</b></p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSend}>Send</Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
}

export default UploadFileMessageModal