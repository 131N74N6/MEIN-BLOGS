import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RelationshipState {
    otherUserId: string;
    setOtherUserId: (otherUserId: string) => void;

    resetRelationShipState: () => void;
}

export const useReltionshipStore = create<RelationshipState>()(persist((set) => ({
    otherUserId: "",
    setOtherUserId: (otherUserId: string) => set({ otherUserId }),

    resetRelationShipState: () => set({
        otherUserId: ""
    })
}), {
        name: "other_user_id",
        partialize: (state) => ({ otherUserId: state.otherUserId }),
    }
));