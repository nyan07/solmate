import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import type { ExpandablePosition } from "./types";

type Props = {
    icon: React.ReactNode;
    title: React.ReactNode;
    children: React.ReactNode;
    position?: ExpandablePosition;
};

const buttonClass: Record<string, Record<string, string>> = {
    standalone: {
        collapsed: "border border-primary-200 bg-primary-50/30 rounded-md",
        expanded: "border border-primary-200 bg-primary-50/30 rounded-t-md",
    },
    first: {
        collapsed: "border border-primary-200 bg-primary-50/30 rounded-t-md",
        expanded: "border-t border-x border-primary-200 bg-primary-50/30 rounded-t-md",
    },
    middle: {
        collapsed: "border-x border-b border-primary-200 bg-primary-50/30",
        expanded: "border-x border-primary-200 bg-primary-50/30",
    },
    last: {
        collapsed: "border-x border-b border-primary-200 bg-primary-50/30 rounded-b-md",
        expanded: "border-x border-primary-200 bg-primary-50/30",
    },
};

const contentClass: Record<string, string> = {
    standalone: "border border-t-0 border-primary-200 bg-primary-50/30 rounded-b-md",
    first: "border-x border-b border-primary-200 bg-primary-50/30",
    middle: "border-x border-b border-primary-200 bg-primary-50/30",
    last: "border-x border-b border-primary-200 bg-primary-50/30 rounded-b-md",
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
                    className={`w-4 h-4 text-neutral-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
            </button>
            {expanded && <div className={`pl-6 py-4 ${contentClass[position]}`}>{children}</div>}
        </div>
    );
};
