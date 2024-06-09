import { MountainIcon } from "lucide-react";
import { Button } from "../ui/button";
import { NavLink, Outlet } from "react-router-dom";
import { LinkProps } from "@/types/types";
import useAuth from "@/hooks/use-auth";
import UserNav from "@/components/shared/user-nav";
import RoomsMobileNav from "./rooms-mobile-nav";

const Links: LinkProps[] = [
    { to: "/auth/login", label: "Login", variant: "outline", size: "sm" },
    { to: "/auth/signup", label: "Sign up", size: "sm" }
];

const HeaderLayout = () => {

    const { auth } = useAuth();

    return (
        <>
            <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm dark:bg-gray-950/90">
                <div className="w-full max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-14 items-center">

                        <div className="flex space-x-2 items-center justify-between">
                            {auth && (
                                <NavLink to={"/"} className="flex items-center px-4">
                                    <MountainIcon className="h-6 w-6" />
                                    <span className="sr-only">Home Page</span>
                                </NavLink>
                            )}
                            <RoomsMobileNav />

                        </div>



                        <nav className="hidden md:flex gap-4">
                            Other links right here
                        </nav>

                        <div className="flex items-center gap-4">
                            {!auth && Links.map((link) => (
                                <Button
                                    variant={link.variant || "default"}
                                    key={link.label}
                                >
                                    <NavLink to={link.to}>
                                        {link.label}
                                    </NavLink>
                                </Button>
                            ))}
                            {auth && (
                                <UserNav />
                            )}

                        </div>

                    </div>
                </div>
            </nav>

            <Outlet />
        </>
    );
}

export default HeaderLayout;