import React from "react";
import type { Variant, Size } from "./types";

const ICON_CLS = "w-4 h-4 shrink-0";

const BASE =
    "rounded-md text-sm transition-colors duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:cursor-not-allowed";

const SIZE: Record<Size, string> = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
};

const VARIANT: Record<Variant, { base: string; selected: string }> = {
    filled: {
        base: "bg-primary text-neutral-50 hover:bg-accent disabled:bg-primary-200 disabled:text-primary-400",
        selected:
            "bg-accent text-neutral-50 hover:bg-accent-600 disabled:bg-primary-200 disabled:text-primary-400",
    },
    outline: {
        base: "border border-primary text-primary hover:border-accent hover:text-accent bg-transparent disabled:border-primary-200 disabled:text-primary-300",
        selected:
            "border border-primary bg-primary-100 text-primary hover:border-accent hover:text-accent disabled:border-primary-200 disabled:text-primary-300",
    },
    ghost: {
        base: "bg-white border border-primary-200 text-primary hover:border-accent hover:text-accent disabled:border-primary-200 disabled:text-primary-300",
        selected:
            "bg-primary-100 border border-primary text-primary hover:border-accent hover:text-accent disabled:border-primary-200 disabled:text-primary-300",
    },
};

type IconProp = React.ReactElement<{ className?: string }>;

type BaseProps = {
    children?: React.ReactNode;
    leadingIcon?: IconProp;
    trailingIcon?: IconProp;
    /** Accessible label for icon-only buttons (rendered as aria-label). Required when children is absent. */
    label?: string;
    variant?: Variant;
    size?: Size;
    /** Marks the button as a toggle. Sets aria-pressed and applies the selected visual style. */
    selected?: boolean;
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

const sizeIcon = (icon: IconProp) => React.cloneElement(icon, { className: ICON_CLS });

const Button = ({
    children,
    leadingIcon,
    trailingIcon,
    label,
    variant = "filled",
    size = "md",
    selected,
    className = "",
    ...rest
}: Props) => {
    if (import.meta.env.DEV && !children && !label) {
        console.warn(
            "Button: icon-only button is missing a `label` prop — accessibility name will be empty."
        );
    }

    const pad = SIZE[size];
    const variantCls = selected ? VARIANT[variant].selected : VARIANT[variant].base;
    const cls = `${BASE} ${pad} ${variantCls} ${className}`;
    const ariaLabel = !children && label ? label : undefined;

    const content = (
        <>
            {leadingIcon && sizeIcon(leadingIcon)}
            {children && <span className="flex-grow text-center">{children}</span>}
            {trailingIcon && sizeIcon(trailingIcon)}
        </>
    );

    if ("href" in rest && rest.href !== undefined) {
        const { href, ...linkProps } = rest as AsLink;
        return (
            <a href={href} {...linkProps} className={cls} aria-label={ariaLabel}>
                {content}
            </a>
        );
    }

    const { ...buttonProps } = rest as AsButton;
    return (
        <button
            type="button"
            {...buttonProps}
            className={cls}
            aria-label={ariaLabel}
            aria-pressed={selected}
        >
            {content}
        </button>
    );
};

export default Button;
