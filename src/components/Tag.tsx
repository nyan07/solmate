type TagProps = {
    name: string;
    className?: string;
}

export const Tag = ({ name, className }: TagProps) => {
    return (<span className={`rounded-2xl px-3 pb-0.5 border border-primary text-primary ${className}`}>{name.toLocaleLowerCase()}</span>);
}