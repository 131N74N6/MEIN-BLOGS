import { cn } from "../styles/utils";
import type { UserMessageData } from "./model";

export default function ChatData(props: UserMessageData) {
    const isSelected = props.chosen_message_ids.includes(props.data._id);
    const isUpdated =  props.data.created_at === props.data.updated_at;

    return (
        <div 
            className={cn(
                "text-base font-medium p-2 flex flex-col gap-2",
                props.is_own ? "rounded-t-lg rounded-br-lg bg-zinc-100 text-zinc-800" : 
                "rounded-t-lg rounded-bl-lg bg-zinc-800 text-zinc-100",
                props.is_select_mode ? "cursor-pointer hover:opacity-80" : "",
                isSelected ? "bg-amber-200 ring-1 ring-amber-700 text-zinc-900" : ""
            )}
        >
            {props.data.media.length < 0 ? null : (
                <button></button>
            )}
            {props.data.message ? (
                <p className="font-medium text-base text-zinc-800">{props.data.message}</p>
            ) : null}
            {isUpdated ? (
                <div className="flex flex-col gap-1.5">
                    <p className="font-normal text-sm text-zinc-800">
                        Sent: {new Date(props.data.created_at).toLocaleString()}
                    </p>
                    <p className="font-normal text-sm text-zinc-800">
                        Edited: {new Date(props.data.updated_at).toLocaleString()}
                    </p>
                </div>
            ) : (
                <p className="font-normal text-sm text-zinc-800">
                    Sent: {new Date(props.data.created_at).toLocaleString()}
                </p>
            )}
        </div>
    );
}