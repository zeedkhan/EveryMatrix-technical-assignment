import { useState, useTransition } from "react";
import * as z from "zod";
import AuthComponentWrapper from "./card-wrapper";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthErrorMsg } from "./auth-error-msg";
import { AuthSuccessMsg } from "./auth-success-msg";
import useAuth from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

const LoginForm = () => {

    const { signIn, isLoaded, auth } = useAuth();

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();


    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            signIn(values)
                .then((data) => {
                    if (data?.error) {
                        setError(data.error);
                        form.reset();
                    }

                    if (data?.success) {
                        setSuccess(data.success);
                        form.reset();
                    }

                })
                .catch(() => setError("Something went wrong"));
        });
    };

    if (isLoaded && auth?.user) {
        return <Navigate to={"/"} />;
    }

    return (
        <AuthComponentWrapper
            headerLabel="Welcome back!"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="john.doe@example.com"
                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="******"
                                                type="password"
                                            />
                                        </FormControl>
                                        <Button
                                            size="sm"
                                            variant="link"
                                            asChild
                                            className="px-0 font-normal"
                                        >
                                            {/* <Link href="/auth/reset"> */}
                                            Forgot password?
                                            {/* </Link> */}
                                        </Button>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    </div>
                    <AuthErrorMsg message={error} />
                    <AuthSuccessMsg message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        Login
                    </Button>
                </form>
            </Form>
        </AuthComponentWrapper>
    );
}

export default LoginForm;