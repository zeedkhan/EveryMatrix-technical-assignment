import axios from "@/api/axios";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import useSocket from "@/hooks/socket-io";
import useAuth from "@/hooks/use-auth";
import RoomStore from "@/state/room";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const Gifs = () => {

    const [gifs, setGifs] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const { auth } = useAuth();
    const { currentChat } = RoomStore();

    const limit = 10;
    const baseURL = `https://api.giphy.com/v1/gifs`;
    const trendingURL = `${baseURL}/trending`;
    // const searchURL = `${baseURL}/search`;

    const socket = useSocket();

    const [offset, setOffset] = useState(limit);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        const loadGifs = async () => {
            try {
                const res = await axios.get(`${trendingURL}?api_key=${import.meta.env.VITE_GIPHY_API}&limit=${limit}`);

                setGifs(res.data.data);

            } catch (err) {
                console.error(err);
            }
        }

        loadGifs();

    }, [open])

    const loadMore = async () => {
        if (!open || loading) return;
        setLoading(true);
        try {
            const res = await axios.get(`${trendingURL}?api_key=${import.meta.env.VITE_GIPHY_API}&limit=${limit}&offset=${offset}`);
            setGifs((prev) => [...prev, ...res.data.data]);
            setOffset(offset + limit)
        } catch (err) {
            toast.error("Failed to load more gifs");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleClick = (gifData: any) => {
        setOpen(false);
        if (!auth?.user || !currentChat) {
            return null;
        }
        socket.emit("message", {
            chatRoomId: currentChat.id,
            userId: auth.user.id,
            type: "FILE",
            text: "",
            file: [{
                name: "",
                size: 0,
                key: gifData.images.original.url,
                url: gifData.images.original.url,

            }],
            createdAt: new Date().toISOString(),
            id: uuidv4()
        });
    }

    return (
        <>
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger className="font-bold text-gray-600">
                    GIF
                </PopoverTrigger>
                <PopoverContent
                    onScroll={async (e) => {
                        //@ts-ignore
                        if (Math.floor(e.target.scrollHeight - e.target.scrollTop) === Math.floor(e.target.clientHeight)) {
                            await loadMore()
                        }
                    }}
                    className="h-80 w-full overflow-hidden overflow-y-auto">
                    <div
                        className="grid grid-cols-3 gap-4"
                    >
                        {gifs.map((i, key) => (
                            <img
                                id={`gif-${key}`}
                                onClick={() => handleClick(i)}
                                key={`gif-${key}`}
                                className="w-28 h-28 cursor-pointer"
                                src={i.images.original.url}
                                alt="gif"
                            />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}


export default Gifs;