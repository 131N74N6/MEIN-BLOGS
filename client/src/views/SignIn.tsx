import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
    const navigate = useNavigate();
    
    return (
        <div className="flex justify-center items-center h-dvh bg-background p-2.5">
            <FieldSet className="w-full max-w-xs border border-secondary-foreground p-2.5 rounded">
                <FieldLegend>Sign In</FieldLegend>
                <FieldDescription>Welcome back</FieldDescription>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input id="username" type="text" placeholder="Max Leiter"/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" type="password" placeholder="••••••••"/>
                    </Field>
                </FieldGroup>
                <Button>Sign In</Button>
                <FieldDescription className="flex justify-center gap-3 items-center">
                    <div>Don't have any account ?</div>
                    <Button variant={"link"} size={"icon"} onClick={() => navigate("/")}>Sign Up</Button>
                </FieldDescription>
            </FieldSet>
        </div>
    );
}