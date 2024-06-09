import useAuth from "@/hooks/use-auth";
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { auth, isLoaded } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!isLoaded) return;

    }, [auth, isLoaded]);

    if (!isLoaded && !auth?.user) {
        return <Navigate to={"/auth/login"} state={{ from: location }} />;
    }

    return children;
};


export default ProtectedRoute;