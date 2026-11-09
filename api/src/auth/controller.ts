import { TAuths } from "./model";
import authService from "./service";
import { Cookie } from "elysia";

class AuthController {
    async signin(authCookie: Cookie<string>, jwtSign: (payload: TAuths["jwt_payload"]) => Promise<string>, userInput: TAuths["sign_in"]) {
        const token = await authService.signIn(jwtSign, userInput);
        this.setCookie(authCookie, token);
        return { message: "sign in successful", success: true };
    }

    async signOut(authCookie: Cookie<string>) {
        authCookie.remove();
        return { message: "signed out successfully", success: true };
    }

    async signUp(authCookie: Cookie<string>, jwtSign: (payload: TAuths["jwt_payload"]) => Promise<string>, userInput: TAuths["sign_up"]) {
        const token = await authService.signUp(jwtSign, userInput);
        this.setCookie(authCookie, token);
        return { message: "sign up successful", success: true };
    }

    setCookie(cookie: Cookie<string>, token: string) {
        cookie.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        });
    }
}

const authController = new AuthController();

export default authController;