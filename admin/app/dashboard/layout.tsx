"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/');
                return;
            }

            setUserEmail(session.user.email || null);
            if (session.user.email === 'jjx2121@gmail.com') {
                setIsSuperAdmin(true);
            }
            setLoading(false);
        };
        checkSession();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-gray-100 text-black">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight">Blind Admin</h2>
                    <p className="text-sm text-gray-500 mt-1 truncate">{userEmail}</p>
                </div>
                <nav className="mt-6 flex flex-col gap-2 px-4">
                    <Link href="/dashboard" className="p-3 hover:bg-gray-50 rounded-md font-medium">Overview</Link>
                    <Link href="/dashboard/waitlist" className="p-3 hover:bg-gray-50 rounded-md font-medium">Waitlist</Link>
                    {isSuperAdmin && (
                        <Link href="/dashboard/admins" className="p-3 text-purple-600 hover:bg-purple-50 rounded-md font-medium">Manage Admins</Link>
                    )}
                </nav>
                <div className="absolute bottom-0 w-64 p-4">
                    <button onClick={handleLogout} className="w-full p-3 text-red-600 hover:bg-red-50 rounded-md font-medium text-left">
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
