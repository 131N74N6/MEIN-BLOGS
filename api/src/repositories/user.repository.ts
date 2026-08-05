import { ChangeUserIntrf, UserIntrf, Users } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Blogs } from "../models/blog.model";
import { v2 } from "cloudinary";

class AuthRepository {
    async changeUser(props: ChangeUserIntrf) {
        try {
            const user = await Users.findOne({ _id: props.currentUserId });
            if (!user) throw new Error("user not found");

            if (props.selectedImage) {
                await v2.uploader.destroy(user.profile_picture.public_id, { 
                    resource_type: user.profile_picture.resource_type 
                });
            }

            await Users.updateOne({ _id: user._id }, {
                username: props.username || user.username
            });
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(currentUserId: string) {
        try {
            const mediaDeleteOperations = [];

            const user = await Users.findOne({ _id: currentUserId });
            if (!user) throw new Error("user not found");

            const blogs = await Blogs.find({ blog_owner_id: user._id });
            const blogsMedia = blogs.map(blog => blog.media || []);

            if (blogsMedia.length > 0) {
                const deleteFromCloudinary = blogsMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });
                mediaDeleteOperations.push(...deleteFromCloudinary);
            }

            if (user.profile_picture && user.profile_picture.public_id) {
                const deleteProfile = await v2.uploader.destroy(user.profile_picture.public_id, { 
                    resource_type: user.profile_picture.resource_type 
                });

                mediaDeleteOperations.push(deleteProfile);
            }

            if (mediaDeleteOperations.length > 0) {
                await Promise.all([
                    ...mediaDeleteOperations,
                    Blogs.deleteMany({ blog_owner_id: user._id }),
                    Users.deleteOne({ _id: currentUserId })
                ]);
            } else {
                await Promise.all([
                    Blogs.deleteMany({ blog_owner_id: user._id }),
                    Users.deleteOne({ _id: currentUserId })
                ]);
            }

        } catch (error) {
            throw error;
        }
    }

    async signIn(props: Pick<UserIntrf, "password" | "username">) {
        try {
            if (!props.username && !props.password) throw new Error("all fields are required");
            if (!props.password) throw new Error("please provide password");
            if (!props.username) throw new Error("please provide username");

            const isUserFound = await Users.findOne({ username: props.username });
            if (!isUserFound) throw new Error("user not found");

            const isPasswordMatch = await bcrypt.compare(props.password, isUserFound.password);
            if (!isPasswordMatch) throw new Error("incorrect password");

            const token = jwt.sign(
                { user_id: isUserFound._id, username: isUserFound.username },
                process.env.JWT_KEY || "your_secret_key",
                { expiresIn: "1d" }
            );

            return token;
        } catch (error) {
            throw error;
        }
    }
    
    async signUp(props: UserIntrf) {
        try {
            if (!props.username && !props.password && !props.email) throw new Error("all fields are required");
            if (!props.email) throw new Error("please provide email");
            if (!props.password) throw new Error("please provide password");
            if (!props.username) throw new Error("please provide username");

            const isUsernameExist = await Users.findOne({ username: props.username });
            if (isUsernameExist) throw new Error("this username has been taken");

            const isEmailExist = await Users.findOne({ email: props.email });
            if (isEmailExist) throw new Error("this email has been taken");

            const hashedPassword = await bcrypt.hash(props.password, 10);

            const newUser = new Users({
                email: props.email,
                password: hashedPassword,
                profile_picture: null,
                username: props.username
            });

            await newUser.save();

            const token = jwt.sign(
                { user_id: newUser._id, username: newUser.username }, 
                process.env.JWT_KEY || "your_secret_key",
                { expiresIn: "1d" }
            );

            return token;
        } catch (error) {
            throw error;
        }
    }

    async showProfile(currentUserId: string) {
        try {
            const user = await Users.findOne({ _id: currentUserId }, { password: 0 }).lean();
            if (!user) throw new Error("user not found");

            return user;
        } catch (error) {
            throw error;
        }
    }
}

const authRepository = new AuthRepository();

export default authRepository;