type TagProps = {
    name: string;
    className?: string;
}

export const Tag = ({ name, className }: TagProps) => {
    return (<span className={`rounded-full px-4 py-1 border text-neutral-lightest border-primary-300 bg-primary-300 text-xs ${className}`}>{name.toLocaleLowerCase()}</span>);
}