import { useNavigate } from "react-router-dom";
import type { ViewerIntrf } from "../models/viewerModel";
import { useViewerStore } from "../stores/useViewerStore";

export default function Viewer(props: ViewerIntrf) {
    const navigate = useNavigate();
    const setUserId = useViewerStore((state) => state.setUserId);

    return (
        <div className="border-b border-slate-400 flex flex-col gap-2">
            <button
                className="font-normal"
                onClick={() => {
                    navigate(`/person/${props.user_id}`);
                    setUserId(props.user_id);
                }}
                type="button"
            >
                {props.username}
            </button>
            <div className="font-normal">{props.username} has visited this blog at {new Date(props.created_at).toLocaleString()}</div>
        </div>
    )
}