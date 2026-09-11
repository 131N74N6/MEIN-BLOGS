import { AudioLines, Download, File, X, CircleOff } from "lucide-react";
import type { ChatMediaViewer } from "./model";
import { cn } from "../styles/utils";
import { useUserChatStore } from "./store";

export default function MediaPreview(props: ChatMediaViewer) {
    const removeMedia = useUserChatStore((state) => state.removeMedia);

    if (props.place.media.length === 0) {
        if (props.place.name === "media-raw-preview") {
            return (
                <div 
                    className="cursor-pointer flex justify-center items-center w-full h-full border-x border-dashed border-zinc-800"
                    onClick={props.place.openFileSelector}
                >
                    <div className="flex justify-center flex-col gap-2">
                        <div className="text-center text-base text-zinc-800 font-medium">
                            Click here to pick your file
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="flex justify-center items-center w-full h-full border-x border-b border-zinc-800">
                    <div className="flex justify-center flex-col gap-2">
                        <div className="flex justify-center"><CircleOff size={30}/></div>
                        <div className="text-center text-lg text-zinc-800 font-medium">
                            This user has not sent any files
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (props.place.name === "media-raw-preview") {
        return (
            <div 
                className={cn(
                    "border-x border-zinc-800 h-full p-2 overflow-y-auto",
                    "grid gap-2 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2",
                )} 
                onClick={props.place.openFileSelector}
            >
                {props.place.media.map(media => {
                    const removePreviewedChatMedia = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        event.stopPropagation();
                        removeMedia(media.filename);
                    }

                    return (
                        media.filetype.startsWith("image/") ? (
                            <div className="relative" key={`previewed-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={removePreviewedChatMedia}
                                    type="button"
                                >
                                    <X size={18}/>
                                </button>
                                <img 
                                    src={media.url} 
                                    className="object-cover aspect-square rounded-lg" 
                                    alt={media.filename}
                                />
                            </div>
                        ) : media.filetype.startsWith("video/") ? (
                            <div className="relative" key={`previewed-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={removePreviewedChatMedia}
                                    type="button"
                                >
                                    <X size={18}/>
                                </button>
                                <video 
                                    src={media.url} 
                                    className="object-cover aspect-square rounded-lg"
                                />
                            </div>
                        ) : media.filetype.startsWith("audio/") ? (
                            <div className="relative" key={`previewed-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={removePreviewedChatMedia}
                                    type="button"
                                >
                                    <X size={18}/>
                                </button>
                                <div 
                                    className={cn(
                                        "flex justify-center items-center", 
                                        "aspect-square border border-zinc-800 rounded-lg"
                                    )}
                                >
                                    <div className="flex flex-col gap-2">
                                        <AudioLines size={18}/>
                                        <div className="font-medium text-zinc-800 text-sm text-center line-clamp-3">
                                            {media.filename}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative" key={`previewed-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={removePreviewedChatMedia}
                                    type="button"
                                >
                                    <X size={18}/>
                                </button>
                                <div 
                                    className={cn(
                                        "flex justify-center items-center", 
                                        "aspect-square border border-zinc-800 rounded-lg"
                                    )}
                                >
                                    <div className="flex flex-col gap-2">
                                        <File size={18}/>
                                        <div className="font-medium text-zinc-800 text-sm text-center line-clamp-3">
                                            {media.filename}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    );
                })}
            </div>
        );
    } else {
        return (
            <div
                className={cn(
                    "border-x border-b border-zinc-800 h-full p-2 overflow-y-auto",
                    "grid gap-2 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2"
                )} 
            >
                {props.place.media.map(media => {
                    const downloadFile = async () => {
                        try {
                            const response = await fetch(media.url);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = media.public_id || "download";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        } catch (error) {
                            window.open(media.url, "_blank");
                        }
                    };
                    
                    return (
                        media.filetype.startsWith("image/") ? (
                            <div className="relative" key={`uploaded-media-${media.filename}`}>
                                <img 
                                    src={media.url} 
                                    className="object-cover aspect-square rounded-lg" 
                                    alt={media.filename}
                                />
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={downloadFile}
                                    type="button"
                                >
                                    <Download size={18}/>
                                </button>
                            </div>
                        ) : media.filetype.startsWith("video/") ? (
                            <div className="relative" key={`uploaded-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={downloadFile}
                                    type="button"
                                >
                                    <Download size={18}/>
                                </button>
                                <video 
                                    src={media.url} 
                                    className="object-cover aspect-square rounded-lg"
                                />
                            </div>
                        ) : media.filetype.startsWith("audio/") ? (
                            <div className="relative" key={`uploaded-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={downloadFile}
                                    type="button"
                                >
                                    <Download size={18}/>
                                </button>
                                <div 
                                    className={cn(
                                        "flex justify-center items-center", 
                                        "aspect-square border border-zinc-800 rounded-lg"
                                    )}
                                >
                                    <div className="flex flex-col gap-2">
                                        <AudioLines size={18}/>
                                        <div className="font-medium text-zinc-800 text-sm text-center line-clamp-3">
                                            {media.filename}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative" key={`uploaded-media-${media.filename}`}>
                                <button 
                                    className={cn(
                                        "flex justify-center items-center",
                                        "hover:bg-zinc-100 bg-white ring ring-zinc-800", 
                                        "w-6 h-6 rounded-full absolute top-2 right-2", 
                                        "cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    )}
                                    disabled={props.is_processing} 
                                    onClick={downloadFile}
                                    type="button"
                                >
                                    <Download size={18}/>
                                </button>
                                <div 
                                    className={cn(
                                        "flex justify-center items-center", 
                                        "aspect-square border border-zinc-800 rounded-lg"
                                    )}
                                >
                                    <div className="flex flex-col gap-2">
                                        <File size={18}/>
                                        <div className="font-medium text-zinc-800 text-sm text-center line-clamp-3">
                                            {media.filename}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    );
                })}
            </div>
        );
    }
}