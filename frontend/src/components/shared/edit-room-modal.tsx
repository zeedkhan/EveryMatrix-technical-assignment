import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import RoomStore from "@/state/room";
import { Info, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { axiosPrivate } from "@/api/axios";
import { toast } from "sonner";
import { backendURL, dumpAvatar } from "@/config";

const EditRoomModal = () => {
    const { currentChat } = RoomStore()

    const inputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);

    const [roomName, setRoomName] = useState(currentChat?.name || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
        }
    }

    const handleChangeNames = async () => {
        if (!roomName) return;
        try {
            await axiosPrivate.put(`/api/v1/room/${currentChat?.id}`, {
                name: roomName,
            });
            // const res = req.data;
            toast.success("Room name updated successfully");
        } catch (error) {
            toast.error("Failed to update room name");
            console.log(error)
        }
    }

    const handleUpload = async () => {
        if (!currentChat?.id) return console.log("No chat room id");
        if (!file) return console.log("No file");
        const formData = new FormData();
        formData.append("image", file)

        try {
            const req = await axiosPrivate.post("/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const res = req.data;

            // update user avatar in database
            await axiosPrivate.put(`/api/v1/room/avatar/${currentChat?.id}`, {
                storePath: res.storePath,
            });

            toast.success("Room avatar updated successfully");

        } catch (error) {
            toast.error("Failed to update room avatar");
            console.log(error)
        }

    }

    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    useEffect(() => {
        setRoomName(currentChat?.name || '')
    }, [])

    if (!currentChat) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Info
                    className='text-blue-600 hover:cursor-pointer'
                />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit chat room</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>


                    <div className="flex flex-col space-y-4 pt-4">
                        <Avatar className="self-center h-fit w-fit">
                            <input type="file" hidden ref={inputRef} accept="image/*" onChange={handleFileChange} />
                            <AvatarImage
                                width={128}
                                height={128}
                                className="rounded-full h-[128px] w-[128px] object-cover"
                                src={file ? preview as string : currentChat.avatar ? backendURL + currentChat.avatar : dumpAvatar}
                            />

                            <AvatarFallback>CN</AvatarFallback>

                            <div className="cursor-pointer fixed left-1/2 translate-x-full  bg-white p-1 rounded-xl">
                                <Settings
                                    onClick={() => inputRef.current?.click()}
                                />
                            </div>

                        </Avatar>

                        <Button
                            onClick={handleUpload}
                            className="w-1/2 m-auto"
                            disabled={!file?.name}
                        >
                            <span>Save</span>
                        </Button>
                    </div>

                    <div className="pt-4">
                        <Card>
                            <CardHeader>
                                <h2 className="text-gray-600 font-bold">Change chat room</h2>
                            </CardHeader>
                            <CardContent className="flex flex-col space-y-2">
                                <Input
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    id="room-name"
                                    placeholder={currentChat.name}
                                />
                            </CardContent>

                            <CardFooter>
                                <Button
                                    onClick={handleChangeNames}
                                    disabled={roomName === currentChat.name || !roomName}
                                >
                                    <span>Save</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>



                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

export default EditRoomModal;