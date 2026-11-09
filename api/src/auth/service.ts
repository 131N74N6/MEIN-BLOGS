import { BlogApiError } from "../error/service";
import { TAuths } from "./model";
import authRepository from "./repository";

class AuthService {
    private checkIsInputValid(field: string, value: unknown) {
        if (typeof value !== "string" || !value || value === "") {
            throw new BlogApiError(400, `invalid ${field}`);
        }

        const trimmed = value.trim();
        return trimmed;
    }

    async signIn(jwtSign: (payload: TAuths["jwt_payload"]) => Promise<string>, userInput: TAuths["sign_in"]) {
        const email = this.checkIsInputValid("email", userInput.email);
        const password = this.checkIsInputValid("password", userInput.password);

        const user = await authRepository.findUserByEmail(email);
        if (!user) throw new BlogApiError(401, "Invalid email or password");

        const isPasswordMatch = await Bun.password.verify(userInput.password, user.password);
        if (!isPasswordMatch) throw new BlogApiError(401, "Invalid email or password");

        const payload: TAuths["jwt_payload"] = { _id: user._id.toString() }
        const token = await jwtSign(payload);

        return token;
    }
    
    async signUp(jwtSign: (payload: TAuths["jwt_payload"]) => Promise<string>, userInput: TAuths["sign_up"]) {
        const email = this.checkIsInputValid("email", userInput.email);
        const password = this.checkIsInputValid("password", userInput.password);
        const username = this.checkIsInputValid("username", userInput.username);

        const usernameExist = await authRepository.findUserByUserName(username);
        if (usernameExist) throw new BlogApiError(409, "invalid username");

        const emailExist = await authRepository.findUserByEmail(email);
        if (emailExist) throw new BlogApiError(409, "invalid email");

        const hashedPassword = await Bun.password.hash(password);
        const newUser = { email: email, password: hashedPassword, username: username }
        const insertedUser = await authRepository.addNewUser(newUser);

        const payload: TAuths["jwt_payload"] = { _id: insertedUser._id }
        const token = await jwtSign(payload);

        return token;
    }
}

const authService = new AuthService();

export default authService;