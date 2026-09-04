import { cn } from "../styles/utils";
import type { UserMessageData } from "./model";

export default function ChatData(data: UserMessageData) {
    const isSelected = data.chosen_message_ids.includes(data.message._id);
    const createdAt = new Date(data.message.created_at).toLocaleString();
    const updatedAt = new Date(data.message.updated_at).toLocaleString();
    const isUpdated =  createdAt === updatedAt;

    return (
        <div 
            className={cn(
                "text-base font-medium p-2 flex flex-col gap-2",
                data.is_own ? "rounded-t-lg rounded-br-lg bg-zinc-100 text-zinc-800" : 
                "rounded-t-lg rounded-bl-lg bg-zinc-800 text-zinc-100",
                data.is_select_mode ? "cursor-pointer hover:opacity-80" : "",
                isSelected ? "bg-amber-200 ring-1 ring-amber-700 text-zinc-900" : ""
            )}
        >
            <p>{data.message.message}</p>
            <p>{new Date(data.message.created_at).toLocaleString()}</p>
            {isUpdated ? () : null}
        </div>
    );
}