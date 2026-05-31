import React from "react";

const CLS = "underline hover:text-primary-700 transition-colors";

type AsButton = React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type AsAnchor = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type Props = AsButton | AsAnchor;

export function InlineLink({ className = "", ...rest }: Props) {
    const cls = `${CLS} ${className}`.trim();

    if ("href" in rest && rest.href !== undefined) {
        const { href, children, ...anchorProps } = rest as AsAnchor;
        return (
            <a href={href} {...anchorProps} className={cls}>
                {children}
            </a>
        );
    }

    return <button type="button" {...(rest as AsButton)} className={cls} />;
}
