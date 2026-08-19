import React, { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-md";

    const variants = {
        primary:
            "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
        secondary:
            "bg-earth-100 text-earth-900 hover:bg-earth-200 focus:ring-earth-300",
        outline:
            "border border-slate-300 text-slate-800 hover:bg-slate-50 focus:ring-slate-400",
        ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
        accent: "bg-accent text-white hover:bg-accent-dark focus:ring-accent-light",
    };


    const sizes = {
        sm: "text-xs px-3 py-1.5 min-h-[32px]",
        md: "text-sm px-5 py-2.5 min-h-[42px]",
        lg: "text-base px-7 py-3.5 min-h-[50px]",
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                className,
            )}
            disabled={disabled || isLoading}
            {...props}>
            {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {children}
        </button>
    );
};
