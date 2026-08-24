import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RelationshipState } from "./model";

export const useRelationStore = create<RelationshipState>()(persist((set) => ({
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