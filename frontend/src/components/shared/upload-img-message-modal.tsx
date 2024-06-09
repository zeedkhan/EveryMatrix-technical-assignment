import useAuth from "@/hooks/use-auth";
import RoomStore from "@/state/room";
import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "../ui/dialog";
import { ImagePlus } from "lucide-react";
import useSocket from "@/hooks/socket-io";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "../ui/button";
import { axiosPrivate } from "@/api/axios";
import { toast } from "sonner";


const UploadImageMessageModal = () => {
    const { auth } = useAuth();
    const { currentChat } = RoomStore();
    const socket = useSocket();

    const fileRef = useRef<HTMLInputElement | null>(null);

    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);


    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }, [file]);

    const handleSend = async () => {
        if (!auth?.user || !currentChat?.id || !socket.id) {
            toast.error("No connection");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("image", file as Blob);

            const res = await axiosPrivate.post<{ storePath: string }>("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log(res.data.storePath)

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
            toast.success("Image sent")
        } catch (error) {
            console.error(error)
            toast.error("Failed to send image")
        } finally {
            setOpen(false);
        }
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            setOpen(true);
        }
    }


    if (!auth?.user || !currentChat?.id || !socket.id) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <input type="file" hidden id='upload-image' accept="image/*" ref={fileRef} onChange={handleFileChange} />
                <ImagePlus onClick={() => fileRef.current?.click()} className='cursor-pointer' size={20} />
            </DialogTrigger>
            {preview && (
                <DialogContent>
                    <img src={preview} alt="preview-img" />

                    <DialogFooter>
                        <Button onClick={handleSend}>Send</Button>
                    </DialogFooter>
                </DialogContent>
            )}


        </Dialog>
    );
}

export default UploadImageMessageModal;