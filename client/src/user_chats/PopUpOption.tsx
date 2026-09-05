import type { PopUpOptionData } from "./model";
import { useUserChatStore } from "./store";

export default function PopUpOption(props: PopUpOptionData) {
    const setEditMessage = useUserChatStore((state) => state.setEditMessage);
    const setOpenPopUpOption = useUserChatStore((state) => state.setOpenPopUpOption);

    function closePopUp() {
        setOpenPopUpOption(false);
        setEditMessage(false);
    }

    function editSelectedMessage() {
        setOpenPopUpOption(false);
        setEditMessage(true);
    }
    
    return (
        <div className="flex justify-center items-center h-full z-20 fixed bg-[rgba(0,0,0,0.5)]">
            <section className="bg-white flex flex-col gap-2.5 p-2.5 rounded-md">
                <h3 className="font-medium text-center text-base">
                    What will you dou about all these messages?
                </h3>
                <button
                    className="cursor-pointer ring ring-zinc-800 disabled:cursor-not-allowed bg-white text-zinc-800 font-medium text-sm p-2 w-40 rounded-md hover:bg-white transzinc-80text-zinc-800-colors"
                    disabled={props.isProcessing}
                    onClick={closePopUp}
                    type="button"
                >
                    Cancel
                </button>
                {props.chosenMessageIds.length === 0 ? (
                    <>
                        <button
                            className="cursor-pointer disabled:cursor-not-allowed ring ring-zinc-800 bg-white text-zinc-800 font-medium text-sm p-2 w-40 rounded-md hover:bg-white transzinc-80text-zinc-800-colors"
                            disabled={props.isProcessing}
                            onClick={() => props.deleteAll.mutate()}
                            type="button"
                        >
                            Delete All Messages
                        </button>
                        <button
                            className="cursor-pointer disabled:cursor-not-allowed ring ring-zinc-800 bg-white text-zinc-800 font-medium text-sm p-2 w-40 rounded-md hover:bg-white transzinc-80text-zinc-800-colors"
                            disabled={props.isProcessing}
                            onClick={() => props.clearAll.mutate()}
                            type="button"
                        >
                            Clear All Messages
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="cursor-pointer disabled:cursor-not-allowed ring ring-zinc-800 bg-white text-zinc-800 font-medium text-sm p-2 w-40 rounded-md hover:bg-white transzinc-80text-zinc-800-colors"
                            disabled={props.isProcessing}
                            onClick={() => props.deletChosen.mutate()}
                            type="button"
                        >
                            Delete Chosen Messages
                        </button>
                        <button
                            className="cursor-pointer disabled:cursor-not-allowed ring ring-zinc-800 bg-white text-zinc-800 font-medium text-sm p-2 w-40 rounded-md hover:bg-white transzinc-80text-zinc-800-colors"
                            disabled={props.isProcessing}
                            onClick={() => props.clearChosen.mutate()}
                            type="button"
                        >
                            Clear Chosen Messages
                        </button>
                    </>
                )}
                {props.chosenMessageIds.length === 1 ? (
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed ring ring-zinc-800 bg-white text-zinc-800 font-medium text-sm p-2 w-40 rounded-md hover:bg-white transzinc-80text-zinc-800-colors"
                        disabled={props.isProcessing}
                        onClick={editSelectedMessage}
                        type="button"
                    >
                        Edit Message
                    </button>
                ) : null}
            </section>
        </div>
    )
}