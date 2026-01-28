import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                    block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3
                    text-slate-900 placeholder-slate-400
                    text-sm transition-all duration-200
                    border focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                    disabled:opacity-50 disabled:bg-slate-100
                    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                    ${className}
                `}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-600 font-medium ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600 inline-block" /> {error}
                </p>}
                {!error && helperText && <p className="mt-1.5 text-sm text-slate-500 ml-1">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
