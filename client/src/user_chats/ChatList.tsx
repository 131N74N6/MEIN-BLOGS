import { useCallback, useEffect, useRef } from "react";
import { useUserStore } from "../users/store";
import ChatData from "./ChatData";
import type { UserMessageDataList } from "./model";

export default function ChatList(data: UserMessageDataList) {
    const currentUserId = useUserStore((state) => state.currentUserId);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Ref untuk menyimpan state scroll sebelum memuat pesan lama
    const previousScrollHeightRef = useRef<number>(0);
    const previousScrollTopRef = useRef<number>(0);
    
    // Ref untuk melacak panjang pesan sebelumnya (menggantikan hasLoadedInitialRef)
    const prevMessagesLengthRef = useRef<number>(0);

    // 1. LOGIKA AUTO-SCROLL (Initial Load & Pesan Baru)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || data.messages.length === 0) return;

        const isInitialLoad = prevMessagesLengthRef.current === 0 && data.messages.length > 0;
        const isNewMessage = data.messages.length > prevMessagesLengthRef.current && !data.is_fetching_next_page;

        // Hanya scroll ke bawah jika ini load pertama ATAU ada pesan baru masuk
        if (isInitialLoad || isNewMessage) {
            // requestAnimationFrame memastikan browser sudah selesai menghitung layout DOM
            requestAnimationFrame(() => {
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        }

        // Update panjang pesan untuk referensi berikutnya
        prevMessagesLengthRef.current = data.messages.length;
    }, [data.messages, data.is_fetching_next_page]);

    // 2. LOGIKA PERTAHANKAN POSISI SCROLL (Saat Load Pesan Lama)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (data.is_fetching_next_page) {
            // Simpan posisi scroll DAN tinggi container SEBELUM pesan lama ditambahkan
            previousScrollHeightRef.current = container.scrollHeight;
            previousScrollTopRef.current = container.scrollTop;
        } else if (previousScrollHeightRef.current > 0) {
            // Pesan lama sudah ditambahkan. Hitung selisih tinggi dan sesuaikan scroll.
            const newScrollHeight = container.scrollHeight;
            const heightDiff = newScrollHeight - previousScrollHeightRef.current;
            
            // Tambahkan selisih tinggi ke posisi scroll sebelumnya agar user tetap melihat pesan yang sama
            container.scrollTop = previousScrollTopRef.current + heightDiff;
            
            // Reset agar tidak terpicu lagi
            previousScrollHeightRef.current = 0;
        }
    }, [data.is_fetching_next_page, data.messages]);

    // 3. LOGIKA INFINITE SCROLL (Deteksi user scroll ke atas)
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        
        const { scrollTop } = scrollContainerRef.current;
        
        // Jika user scroll mendekati atas (dalam 50px) dan ada halaman berikutnya
        if (scrollTop < 50 && data.has_next_page && !data.is_fetching_next_page) {
            data.fetch_next_page();
        }
    }, [data.has_next_page, data.is_fetching_next_page, data.fetch_next_page]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    if (data.messages.length === 0) {
        return (
            <section className="border-x border-zinc-800 flex justify-center items-center h-full">
                <div className="text-xl text-gray-800 font-medium">Chats not found</div>
            </section>
        );
    }

    return (
        <div className="overflow-y-auto p-2 flex flex-col gap-2 border-x h-[80%] border-zinc-800" ref={scrollContainerRef}>
            {data.has_next_page ? (
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
            ) : data.messages.length > 0 ? (
                <section className="flex justify-center">
                    <div className="text-base text-gray-800 font-medium">You've reached the end</div>
                </section>
            ) : null}
            <div className="flex flex-col gap-2">
                {data.messages.map(message => (
                    <ChatData 
                        chosen_message_ids={data.chosen_message_ids}
                        is_own={currentUserId === message.sender_id}
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