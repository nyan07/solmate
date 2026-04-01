import type { ReactNode } from "react";

interface StickyHeaderProps {
    title?: ReactNode;
    actions?: ReactNode;
    scrolled?: boolean;
    variant?: "default" | "transparent";
}

function StickyHeader({ title, actions, scrolled, variant = "default" }: StickyHeaderProps) {
    const containerClass =
        variant === "transparent"
            ? `flex items-start gap-2 min-w-0 p-4 ${scrolled && "shadow"}`
            : `flex items-start gap-2 min-w-0 rounded-t-lg p-4 bg-primary-100 ${scrolled && "shadow"}`;

    return (
        <div className="sticky top-0 z-10 bg-neutral-50">
            <div className={containerClass}>
                {title && <div className="flex-1 min-w-0">{title}</div>}
                {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}

export default StickyHeader;
