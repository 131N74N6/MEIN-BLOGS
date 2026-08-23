export type RelationshipState = {
    otherUserId: string;
    setOtherUserId: (otherUserId: string) => void;

    resetRelationShipState: () => void;
}