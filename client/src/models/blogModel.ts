export interface BlogIntrf {
    _id: string;
    blog_owner_id: string;
    blog_owner_profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    blog_owner_name: string;
    created_at: string;
    content: string;
    language: string;
    media: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    title: string;
}