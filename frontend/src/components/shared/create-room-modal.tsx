import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useAuth from "@/hooks/use-auth"
import UseWindowSize from "@/hooks/use-window-size"
import { cn } from "@/lib/utils"
import RoomStore from "@/state/room"
import { PlusCircleIcon } from "lucide-react"
import { useState } from "react"

function CreateRoomModal() {
    const { auth } = useAuth();

    const [roomName, setRoomName] = useState("");

    const [open, setOpen] = useState(false);

    const { createRoom } = RoomStore();

    const { isMobile } = UseWindowSize();


    const handleCreateRoom = async () => {
        if (!auth?.user || !roomName) {
            return;
        }
        try {
            await createRoom(auth?.user.id as string, roomName);
        } catch (error) {
            console.log(error);
        } finally {
            setOpen(false);
            setRoomName("");
        }
    }

    if (!auth?.user) {
        return null;
    }

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                <Button className={cn(
                    "w-full h-full",
                    isMobile ? "rounded-full" : "rounded-md",
                )} variant={"default"}>
                    <PlusCircleIcon />
                    {!isMobile && <p>Create a room</p>}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a new chat room</DialogTitle>
                    <DialogDescription>
                        Name your chat room and start chatting with your friends
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="chat-name" className="text-right">
                            Chat Name
                        </Label>
                        <Input
                            onChange={(e) => setRoomName(e.target.value)}
                            value={roomName}
                            id="chat-name"
                            placeholder="Let's chat"
                            defaultValue="Let's chat"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateRoom} type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateRoomModal;