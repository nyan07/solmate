import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-full text-neutral-lightest 
        bg-primary hover:bg-accent disabled:bg-primary/50
        transition-colors duration-200
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
