import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export type ExpandablePosition = "standalone" | "first" | "middle" | "last";

type Props = {
    icon: React.ReactNode;
    title: React.ReactNode;
    children: React.ReactNode;
    position?: ExpandablePosition;
};

const buttonClass: Record<string, Record<string, string>> = {
    standalone: {
        collapsed: "border border-primary-100 bg-primary-100 rounded-md",
        expanded: "border border-primary-100 bg-primary-100 rounded-t-md",
    },
    first: {
        collapsed: "border border-primary-100 bg-primary-100 rounded-t-md",
        expanded: "border-t border-x border-primary-100 bg-primary-100 rounded-t-md",
    },
    middle: {
        collapsed: "border-x border-b border-primary-100 bg-primary-100",
        expanded: "border-x border-primary-100 bg-primary-100",
    },
    last: {
        collapsed: "border-x border-b border-primary-100 bg-primary-100 rounded-b-md",
        expanded: "border-x border-primary-100 bg-primary-100",
    },
};

const contentClass: Record<string, string> = {
    standalone: "border border-t-0 border-primary-100 bg-primary-100 rounded-b-md",
    first: "border-x border-b border-primary-100 bg-primary-100",
    middle: "border-x border-b border-primary-100 bg-primary-100",
    last: "border-x border-b border-primary-100 bg-primary-100 rounded-b-md",
};

export const Expandable = ({ icon, title, children, position = "standalone" }: Props) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <button
                onClick={() => setExpanded((prev) => !prev)}
                className={`flex items-center gap-2 w-full text-left p-2 ${buttonClass[position][expanded ? "expanded" : "collapsed"]}`}
            >
                {icon}
                <span className="flex-1 text-sm">{title}</span>
                <ChevronDownIcon
                    className={`w-4 h-4 text-neutral-dark/40 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
            </button>
            {expanded && <div className={`pl-6 py-4 ${contentClass[position]}`}>{children}</div>}
        </div>
    );
};
