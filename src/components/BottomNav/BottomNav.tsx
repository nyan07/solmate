import { useNavigate } from "react-router-dom";

export function BottomNav() {
    const navigate = useNavigate();

    return (
        <div className="relative z-50 h-16 shrink-0 flex items-center justify-center bg-white">
            <button onClick={() => navigate("/about")} className="block">
                <img src="/arkie.png" alt="Arkie" className="max-h-10" />
            </button>
        </div>
    );
}
