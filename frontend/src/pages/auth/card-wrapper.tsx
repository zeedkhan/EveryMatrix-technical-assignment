import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthCardHeader } from "./auth-header";

interface AuthComponentWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
}

const AuthComponentWrapper = ({
    children,
    headerLabel
}: AuthComponentWrapperProps) => {
    return (
        <main className="flex items-center justify-center">
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <AuthCardHeader
                        label={headerLabel}
                    />
                </CardHeader>

                <CardContent>
                    {children}
                </CardContent>

            </Card>
        </main>
    );
}

export default AuthComponentWrapper;