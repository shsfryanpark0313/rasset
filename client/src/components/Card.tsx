import React from 'react';


interface CardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ title, description, children, className = '', noPadding = false }) => {
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden ${className}`}>
            {(title || description) && (
                <div className="px-6 xl:px-8 py-5 xl:py-6 border-b border-slate-50">
                    {title && <h3 className="text-xl xl:text-2xl font-bold text-slate-800">{title}</h3>}
                    {description && <p className="mt-2 text-base xl:text-lg text-slate-500">{description}</p>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6 xl:p-8'}>
                {children}
            </div>
        </div>
    );
};

export default Card;
