export interface CommentIntrf {
    _id: string;
    blog_id: string;
    created_at: string;
    text: string;
    user_id: string;
    username: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
}