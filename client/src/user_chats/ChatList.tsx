import ChatData from "./ChatData";
import type { UserMessageDataList } from "./model";

export default function ChatList(data: UserMessageDataList) {
    if (data.messages.length === 0) {
        return (
            <section className="flex justify-center items-center h-full">
                <div className="text-xl text-gray-800 font-medium">Chats not found</div>
            </section>
        );
    }

    return (
        <div className="overflow-y-auto p-2 flex flex-col gap-2">
            {data.messages.length <= 52 ? null : data.has_next_page ? (
                <section className="flex justify-center">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-olive-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-olive-600 transition-colors"
                        disabled={data.is_processing}
                        onClick={() => data.fetch_next_page()}
                        type="button"
                    >
                        Show more
                    </button>
                </section>
            ) : data.is_fetching_next_page ? (
                <section className="flex justify-center">
                    <div className="animate-spin border-t-2 border-b-2 rounded-full w-9 h-9 border-blue-900"></div>
                </section>
            ) : (
                <section className="flex justify-center">
                    <div className="text-base text-gray-800 font-medium">You've reached the end</div>
                </section>
            )}
            <div className="flex flex-col gap-2">
                {data.messages.map(message => (
                    <ChatData 
                        chosen_message_ids={data.chosen_message_ids}
                        is_own={data.is_own}
                        is_processing={data.is_processing}
                        is_select_mode={data.is_select_mode}
                        key={`userchat-${message._id}`} 
                        data={message}
                        set_chosen_message_ids={data.set_chosen_message_ids}
                    />
                ))}
            </div>
        </div>
    );
}