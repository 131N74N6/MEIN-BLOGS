export type UserIdInput = {
    currentUserId: string | undefined;
    setCurrentUserId: (currentUserId: string | undefined) => void;

    otherUserId: string | undefined;
    setOtherUserId: (otherUserId: string | undefined) => void;

    resetUserIdState: () => void;
}

export type OtherUserData = {
    created_at: Date;
    description: string;
    email: string;
    profile_picture: {
        public_id: string;
        url: string;
    } | null;
    user_id: string;
    user_name: string;
}

export type ProfilePictureHeaderIntrf = {
    username: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
}

export type UserProfileState = {
    deleteProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    setDeleteProfilePcture: (deleteProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null) => void;

    newDescription: string;
    setNewDescription: (newDescription: string) => void;

    newProfilePcture: File | null;
    setNewProfilePcture: (newProfilePcture: File | null) => void;

    newProfilePctureUrl: string | null;
    setNewProfilePctureUrl: (newProfilePctureUrl: string | null) => void;

    oldProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    setOldProfilePcture: (oldProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null) => void;

    resetUserProfileState: () => void;

    newUserName: string;
    setNewUserName: (newUserName: string) => void;
}


export type Union = UserProfileState & UserIdInput;