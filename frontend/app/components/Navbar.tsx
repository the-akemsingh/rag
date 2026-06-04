"use client";

import { useEffect, useRef, useState } from "react";
import GoogleSignupButton from "./LoginButton";

type LoggedInUser = {
    id: string;
    email: string;
    name: string | null;
    image?: string | null;
};

export default function Navbar() {
    const [user, setUser] = useState<LoggedInUser | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!showMenu) {
                return;
            }

            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [showMenu]);

    const handleLoginSuccess = (loggedInUser: LoggedInUser) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
        setUser(null);
        setShowMenu(false);
    };

    return (
        <header className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex h-16 w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a0a]/40 px-5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3H9v3H7v-8h10v8h-2v-3h-2v3h-2z" />
                    </svg>
                    <h1 className="text-lg font-bold text-white tracking-tight">RAG</h1>
                </div>

                {user ? (
                    <div ref={menuRef} className="relative flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowMenu((prev) => !prev)}
                            className="rounded-full ring-2 cursor-pointer ring-transparent transition-all hover:ring-zinc-700"
                            aria-label="Open user menu"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-300">
                                {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {showMenu ? (
                            <div className="absolute flex flex-col right-0 top-12 z-20 min-w-32 rounded-md border border-zinc-800 bg-[#111] p-1 shadow-xl">
                                <span className="w-full rounded px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">{user.name}</span>
                                <span className="w-full rounded px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">{user.email}</span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full rounded px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-zinc-800  cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <GoogleSignupButton onLoginSuccess={handleLoginSuccess} />
                    </div>
                )}
            </div>
        </header>
    );
}