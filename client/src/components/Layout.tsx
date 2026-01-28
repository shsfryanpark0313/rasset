import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
    hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    maxWidth = 'md',
    className = '',
    hideHeader = false
}) => {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full'
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            {!hideHeader && (
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        RASSET
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        스마트 미화 시스템 VOC
                    </p>
                </div>
            )}

            <main className={`w-full ${maxWidthClasses[maxWidth]} ${className}`}>
                {children}
            </main>

            <footer className="mt-12 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} RASSET. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
