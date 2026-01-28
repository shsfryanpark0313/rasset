import React from 'react';
import { Loader2 } from 'lucide-react'; // Re-added Loader2 as it was in the original and the instruction didn't explicitly remove it, though the provided code edit used an inline SVG. Keeping it for consistency with original imports.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'; // Added ghost
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 focus:ring-indigo-500 border border-transparent",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-200",
        outline: "bg-transparent hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-600 focus:ring-indigo-500",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 focus:ring-red-500",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-200",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3.5 text-base",
        xl: "px-8 py-4 text-lg",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                widthClass,
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
            ) : (
                <>
                    {leftIcon && <span className="mr-2">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="ml-2">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
