export interface UserIntrf {
    created_at: string;
    email: string;
    password: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    user_id: string;
    username: string;
}