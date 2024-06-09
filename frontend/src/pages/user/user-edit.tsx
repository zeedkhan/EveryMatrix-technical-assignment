import { axiosPrivate } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { backendURL, dumpAvatar } from "@/config";
import useAuth from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Settings } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const UserEdit = () => {
    const { auth, refreshRefreshToken } = useAuth();

    const inputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);

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

    const handleUpload = async () => {
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
            axiosPrivate.put(`/user/${auth?.user.id}`, {
                storePath: res.storePath,
            }).then(async () => await refreshRefreshToken());

            toast.success("Avatar updated successfully")

        } catch (error) {
            toast.error("Failed to update avatar")
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

    if (!auth?.user) return window.location.pathname = "/auth/login";

    return (
        <main>
            <div className="w-full pt-8">
                <Card className="w-[80%] md:w-1/2 m-auto px-2">
                    <CardHeader>
                        <h2 className="text-2xl font-bold">User Edit</h2>
                        <CardDescription className="text-gray-500 font-semibold">
                            Manage your account settings and set e-mail preferences.
                        </CardDescription>
                    </CardHeader>
                    <Separator />

                    <CardContent className="pt-8">
                        <div className="flex flex-col space-y-4">
                            <Avatar className="self-center relative">
                                <input type="file" hidden ref={inputRef} accept="image/*" onChange={handleFileChange} />
                                <AvatarImage
                                    width={128}
                                    height={128}
                                    className="rounded-full h-[128px] w-[128px] object-cover"
                                    src={file ? preview as string : auth.user.avatar ? backendURL + auth.user.avatar : dumpAvatar}
                                />

                                <AvatarFallback>CN</AvatarFallback>

                                <div className="cursor-pointer absolute top-0 right-0 bg-white p-1 rounded-xl">
                                    <Settings
                                        onClick={() => inputRef.current?.click()}
                                    />
                                </div>

                            </Avatar>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button
                            onClick={handleUpload}
                            disabled={!file?.name}
                        >
                            <span>Save</span>
                        </Button>
                    </CardFooter>


                </Card>
            </div>
        </main>
    );
}

export default UserEdit;