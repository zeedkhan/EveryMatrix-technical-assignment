import axios from 'axios';
import { backendURL } from '@/config';
import { LoginSchema, RegisterSchema } from '@/schema';
import { createContext, useState, ReactNode, useEffect, Dispatch } from 'react';
import { Navigate, redirect } from 'react-router-dom';
import { z } from 'zod';
import { axiosPrivate } from '@/api/axios';
import { toast } from 'sonner';


// Define the types
interface AuthContextType {
    signIn: (values: z.infer<typeof LoginSchema>) => Promise<any>;
    signOut: () => void;
    auth: Session | null;
    signup: (data: z.infer<typeof RegisterSchema>) => Promise<any>;
    setAuth: Dispatch<React.SetStateAction<Session | null>>;
    refreshRefreshToken: () => Promise<any>;
    isLoaded: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface Session {
    isSuccess: boolean;
    error: any;
    user: {
        avatar: string;
        email: string;
        id: string;
        name: string;
    }
}


// Create the Auth Context with default values
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {

    const [auth, setAuth] = useState<Session | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    const session = async () => {
        try {
            const checkAuthURL = backendURL + "/api/v1/auth/session";

            const response = await axiosPrivate.post(checkAuthURL, {}, {
                withCredentials: true
            });

            toast.success("Session is active");

            setAuth(response.data);
        } catch (error: unknown) {
            console.log("Failed get session")
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    console.log("Erorr 401")
                    return redirect("/auth/login");
                }
                if (error.response.status === 403) {
                    console.log("Erorr 403")
                    return await refreshToken();
                }
            }

            toast.error("Failed to get session");

            return { error: "Something went wrong!" };
        }
    }

    const signup = async (data: z.infer<typeof RegisterSchema>) => {
        const validatedFields = RegisterSchema.safeParse(data);

        if (!validatedFields.success) {
            return { error: "Invalid fields!" };
        }

        try {
            const signupURL = backendURL + "/api/v1/auth/signup";

            const response = await axiosPrivate.post(signupURL, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const responseData = await response.data;

            console.log("Signup response", responseData);

            toast.success("User created!");

            return { success: "User created!" };
        } catch (error: unknown) {
            // if (axiosPrivate.isAxiosError(error) && error.response) {
            //     return { error: error.response.data.error };
            // }
            console.log(error)
            toast.error("Failed to create user!");
            return { error: "Something went wrong!" };
        }
    };

    const signIn = async (data: z.infer<typeof LoginSchema>) => {
        const validatedFields = LoginSchema.safeParse(data);

        if (!validatedFields.success) {
            return { error: "Invalid fields!" };
        }

        try {
            const loginURL = backendURL + "/api/v1/auth/login";

            const response = await axiosPrivate.post(loginURL, data, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            const responseData = await response.data.user;

            setAuth(responseData)

            console.log("Login response", responseData);

            return window.location.pathname = "/"

        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                return { error: error.response.data.error };
            }
            console.log(error)
            return { error: "Something went wrong!" };
        }
    }

    const logout = async () => {
        console.log("Logging out");

        const logoutURL = backendURL + "/api/v1/auth/logout";

        try {
            const successLogout = await axios.post(logoutURL, {}, {
                withCredentials: true
            });
            console.log("logout data", successLogout.data)
            console.log("Scuccess logout")

            toast.success("Logged out!");
            return window.location.pathname = "/auth/login";

            // return successLogout.data;
        } catch (error: unknown) {
            console.log(error)
            console.log("Failed logout")

            toast.error("Failed to logout!");

            return { error: "Something went wrong!" };
        }
    }

    const refreshRefreshToken = async () => {
        console.log("Refreshing token")
        try {
            const refreshURL = backendURL + "/api/v1/auth/hard-refresh";

            const refresh = await axiosPrivate.post(refreshURL, {
                withCredentials: true
            });

            return {
                refresh: refresh,
                isSuccess: true,
            }
        } catch (error: unknown) {
            console.log(error)
            console.log("Failed refresh token")
            if (axios.isAxiosError(error) && error.response) {
                return { error: error.response, isSuccess: false };
            }
            return { error: "Something went wrong!", isSuccess: false };
        }
    }

    const refreshToken = async () => {
        console.log("Refreshing token")
        try {
            const refreshURL = backendURL + "/api/v1/auth/refresh";

            const res = await axiosPrivate.get(refreshURL, {
                withCredentials: true
            });


            setAuth(res.data.user);

            return {
                isSuccess: true,
            }
        } catch (error: unknown) {
            console.log(error)
            console.log("Failed refresh token")
            if (axios.isAxiosError(error) && error.response) {
                return { error: error.response, isSuccess: false };
            }
            return { error: "Something went wrong!", isSuccess: false };
        }
    };

    const signOut = async () => {
        await logout().finally(() => setAuth(null))
        return <Navigate to={"/"} />;
    };

    useEffect(() => {
        const loadSession = async () => {
            try {
                session();
                setIsLoaded(true);
            } catch (error: unknown) {
                console.log(error)
                setIsLoaded(true);
            }
        }

        loadSession();
    }, []);

    return (
        <AuthContext.Provider value={{ refreshRefreshToken, isLoaded, signIn, signOut, auth, setAuth, signup }}>
            {children}
        </AuthContext.Provider>
    );
};