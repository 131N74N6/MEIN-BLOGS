import { useNavigate } from "react-router-dom";
import { cn } from "../styles/utils";
import type { UserMessageData } from "./model";
import { useUserChatStore } from "./store";
import { useUserStore } from "../users/store";
import { File } from "lucide-react";

export default function ChatData(props: UserMessageData) {
    const navigate = useNavigate();
    const otherUserId = useUserStore((state) => state.otherUserId);

    const selectMode = useUserChatStore((state) => state.selectMode);
    const setChosenMessageId = useUserChatStore((state) => state.setChosenMessageId);

    const setChosenMessage = useUserChatStore((state) => state.setChosenMessage);
    const setChosenMessageIds = useUserChatStore((state) => state.setChosenMessageIds);

    const isSelected = props.chosen_message_ids.includes(props.data._id);
    const isUpdated =  props.data.created_at !== props.data.updated_at;

    const seeMedia = () => {
        navigate(`/users/chats/${otherUserId}/media/detail`);
        setChosenMessageId(props.data._id);
    }

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
                props.is_own ? "rounded-bl-lg bg-zinc-200 ml-[15%] text-zinc-800" : 
                "rounded-br-lg bg-zinc-800 mr-[15%] text-zinc-100",
                props.is_select_mode ? "cursor-pointer hover:opacity-80" : "",
                isSelected ? "bg-amber-200 ring-1 text-amber-950 ring-amber-700" : ""
            )}
            onClick={selectMessage}
        >
            {props.data.media.length === 0 ? null : (
                <button 
                    className={cn(
                        "p-1.5 rounded-md cursor-pointer disabled:cursor-not-allowed",
                        isSelected ? "bg-amber-200 ring-1 text-amber-950 ring-amber-700" : 
                        props.is_own ? "bg-zinc-100 text-zinc-800" : "bg-zinc-700 text-zinc-100"
                    )}
                    disabled={props.is_processing || isSelected || selectMode}
                    onClick={seeMedia}
                    type="button"
                >
                    <section className="flex gap-2">
                        <div><File size={18}/></div>
                        <p>{props.data.media.length > 1 ? "Files" : "File"}</p>
                    </section>
                </button>
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