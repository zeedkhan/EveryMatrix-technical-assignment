import useAuth from "@/hooks/use-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button";
import { NavLink } from "react-router-dom";
import { backendURL, dumpAvatar } from "@/config";


const UserNav = () => {
    const { auth, signOut } = useAuth();
    if (!auth?.user) return null;

    const url = auth.user.avatar ? backendURL + auth.user.avatar : dumpAvatar;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="pr-4">
                <Avatar>
                    <AvatarImage src={url} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{auth.user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="w-full cursor-pointer">
                    <NavLink to={"/user/edit"} className="flex items-center">
                        <span>User edit</span>
                    </NavLink>
                </DropdownMenuItem>


                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Button
                        onClick={signOut}
                        className="w-full"
                        size={"sm"}
                        variant={"outline"}
                    >
                        Logout
                    </Button>
                </DropdownMenuItem>

                <DropdownMenuItem className="w-full cursor-pointer">
                    <small>{auth.user.id}</small>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserNav;