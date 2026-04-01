import type { TagVariant, TagTone } from "./types";

const BASE = "rounded-full px-3 py-0.5 border text-sm font-semibold";

const FILLED: Record<TagTone, string> = {
    neutral: "bg-primary text-white border-primary",
    success: "bg-success text-white border-success",
    danger: "bg-danger text-white border-danger",
    warning: "bg-warning text-white border-warning",
    info: "bg-info text-white border-info",
};

const OUTLINE: Record<TagTone, string> = {
    neutral: "bg-transparent text-primary border-primary",
    success: "bg-transparent text-success border-success",
    danger: "bg-transparent text-danger border-danger",
    warning: "bg-transparent text-warning border-warning",
    info: "bg-transparent text-info border-info",
};

type TagProps = {
    name: string;
    variant?: TagVariant;
    tone?: TagTone;
};

export const Tag = ({ name, variant = "filled", tone = "neutral" }: TagProps) => {
    const colorCls = variant === "outline" ? OUTLINE[tone] : FILLED[tone];
    return <span className={`${BASE} ${colorCls}`}>{name.toLocaleLowerCase()}</span>;
};
