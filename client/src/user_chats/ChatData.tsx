import { cn } from "../styles/utils";
import type { UserMessageData } from "./model";
import { useUserChatStore } from "./store";

export default function ChatData(props: UserMessageData) {
    const selectMode = useUserChatStore((state) => state.selectMode);
    const setChosenMessage = useUserChatStore((state) => state.setChosenMessage);
    const setChosenMessageIds = useUserChatStore((state) => state.setChosenMessageIds);

    const isSelected = props.chosen_message_ids.includes(props.data._id);
    const isUpdated =  props.data.created_at !== props.data.updated_at;

    const selectMessage = () => {
        if (!selectMode) return;
        setChosenMessageIds(props.data._id);
        if (props.is_own) {
            setChosenMessage(props.data);
        } else {
            setChosenMessage(null);
        }
    }

    return (
        <div 
            className={cn(
                "p-2 flex flex-col gap-2 rounded-t-lg",
                props.is_own ? "rounded-bl-lg bg-zinc-200 ml-[50%] text-zinc-800" : 
                "rounded-br-lg bg-zinc-800 mr-[50%] text-zinc-100",
                props.is_select_mode ? "cursor-pointer hover:opacity-80" : "",
                isSelected ? "bg-amber-200 ring-1 text-amber-950 ring-amber-700" : ""
            )}
            onClick={selectMessage}
        >
            {props.data.media.length < 0 ? null : (
                <button></button>
            )}
            {props.data.message === "" ? null : (
                <p className="font-medium text-base">{props.data.message}</p>
            )}
            {isUpdated ? (
                <div className="flex flex-col gap-1.5">
                    <p className="font-normal text-sm">
                        Sent: {new Date(props.data.created_at).toLocaleString()}
                    </p>
                    <p className="font-normal text-sm">
                        Edited: {new Date(props.data.updated_at).toLocaleString()}
                    </p>
                </div>
            ) : (
                <p className="font-normal text-sm">
                    Sent: {new Date(props.data.created_at).toLocaleString()}
                </p>
            )}
        </div>
    );
}