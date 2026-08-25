export type RelationshipState = {
    otherUserId: string;
    setOtherUserId: (otherUserId: string) => void;

    resetRelationShipState: () => void;
}

export type ViewerDetail = {
    _id: string;
    created_at: string;
    profile_picture: string | null;
    user_id: string;
    username: string;
    followed_user_id: string;
};