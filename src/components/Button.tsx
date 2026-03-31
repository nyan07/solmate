import React from "react";

type Variant = "filled" | "outline";

const BASE = "p-2 rounded-full transition-colors duration-200 text-center";

const VARIANT: Record<Variant, string> = {
    filled: "bg-primary text-neutral-lightest hover:bg-accent disabled:bg-primary-200",
    outline:
        "border border-primary text-primary hover:border-accent hover:text-accent bg-transparent",
};

type BaseProps = {
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
};

type AsButton = BaseProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: never;
    };

type AsLink = BaseProps &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
    };

type Props = AsButton | AsLink;

const Button = ({ children, variant = "filled", className = "", ...rest }: Props) => {
    const cls = `${BASE} ${VARIANT[variant]} ${className}`;

    if ("href" in rest && rest.href !== undefined) {
        const { href, ...linkProps } = rest as AsLink;
        return (
            <a href={href} className={cls} {...linkProps}>
                {children}
            </a>
        );
    }

    const { ...buttonProps } = rest as AsButton;
    return (
        <button className={cls} {...buttonProps}>
            {children}
        </button>
    );
};

export default Button;
