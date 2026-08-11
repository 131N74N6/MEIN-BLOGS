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

export default function SignUp() {
    const navigate = useNavigate();

    return (
        <div className="flex justify-center items-center h-dvh bg-background p-2.5">
            <FieldSet className="w-full max-w-xs border border-secondary-foreground p-2.5 rounded">
                <FieldLegend>Sign Up</FieldLegend>
                <FieldDescription>Hello</FieldDescription>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" type="email" placeholder="MaxLeiter@gmail.com"/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input id="username" type="text" placeholder="Max Leiter"/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" type="password" placeholder="••••••••"/>
                    </Field>
                </FieldGroup>
                <Button>Sign up</Button>
                <FieldDescription className="flex justify-center gap-2.5 items-center">
                    <div>Already have account ?</div>
                    <Button variant={"link"} size={"icon"} onClick={() => navigate("/sign-in")}>Sign In</Button>
                </FieldDescription>
            </FieldSet>
        </div>
    );
}