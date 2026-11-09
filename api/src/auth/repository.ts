import { db } from "../mongodb/service";
import { TAuths } from "./model";

class AuthRepository {
    private users = db().collection("user");

    async addNewUser(props: TAuths["sign_up"]) {
        const insertedUser = await this.users.insertOne({
            created_at: new Date(),
            description: "unknown",
            gender: "unknown",
            email: props.email.trim(),
            username: props.username.trim(),
            password: props.password.trim(),
            profile_picture: {
                file_name: null,
                file_type: null,
                resource_type: null,
                public_id: null,
                url: null,
            },
            updated_at: new Date()
        });

        return {  _id: insertedUser.insertedId.toString() }
    }
    
    async findUserByEmail(email: string) {
        return await this.users.findOne({ email: email.trim() });
    }
    
    async findUserByUserName(name: string) {
        return await this.users.findOne({ username: name.trim() });
    }
}

const authRepository =  new AuthRepository();

export default authRepository;