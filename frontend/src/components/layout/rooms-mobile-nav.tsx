import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import useAuth from "@/hooks/use-auth";
import DisplayRoom from "@/pages/chat/rooms-";
import { Menu } from 'lucide-react';


const RoomsMobileNav = () => {
    const { auth } = useAuth();
    if (!auth?.user) return null;

    return (
        <Sheet>
            <SheetTrigger>
                <Menu />
            </SheetTrigger>
            <SheetContent className="overflow-hidden overflow-y-scroll ">
                <SheetHeader>
                    <SheetTitle className="text-center">Select a chat to start conversation</SheetTitle>
                    <SheetDescription className="text-center">
                        To start a conversation, select a chat from the list
                    </SheetDescription>
                </SheetHeader>
                <DisplayRoom extraClasses="w-full overflow-visible overflow-y-visible p-0" />
            </SheetContent>
        </Sheet>
    );
}

export default RoomsMobileNav;