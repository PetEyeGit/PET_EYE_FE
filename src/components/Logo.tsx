import React from 'react';

export default function Logo({ className = '', lightText = false }: { className?: string, lightText?: boolean }) {
    return (
        <div className={`flex items-center gap-2.5 text-primary group ${className}`}>
            <div className="size-10 relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="relative bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm text-primary flex items-center justify-center">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        {/* Eye Contour */}
                        <path
                            d="M24 10C13.5 10 4 24 4 24C4 24 13.5 38 24 38C34.5 38 44 24 44 24C44 24 34.5 10 24 10ZM24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14C29.5228 14 34 18.4772 34 24C34 29.5228 29.5228 34 24 34Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            opacity="0.3"
                        />
                        {/* Paw print as pupil */}
                        <path
                            d="M24 30.5C26.5 30.5 28.5 28.5 28.5 26C28.5 23.5 25 23 24 23C23 23 19.5 23.5 19.5 26C19.5 28.5 21.5 30.5 24 30.5Z"
                            fill="currentColor"
                        />
                        <circle cx="18.5" cy="22.5" r="2.2" fill="currentColor" />
                        <circle cx="21.5" cy="18.5" r="2.5" fill="currentColor" />
                        <circle cx="26.5" cy="18.5" r="2.5" fill="currentColor" />
                        <circle cx="29.5" cy="22.5" r="2.2" fill="currentColor" />
                    </svg>
                </div>
            </div>
            <h2 className={`${lightText ? 'text-white' : 'text-slate-900 dark:text-white'} text-2xl font-extrabold tracking-tight`}>Peteye</h2>
        </div>
    );
}
