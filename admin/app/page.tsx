"use client";
import { useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check if it's the super admin
        if (email === 'jjx2121@gmail.com') {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
                setError(signInError.message);
                return;
            }
            router.push('/dashboard');
            return;
        }

        // Otherwise, check if they are in admin_roles
        const { data: adminRole, error: roleError } = await supabase
            .from('admin_roles')
            .select('*')
            .eq('email', email)
            .single();

        if (roleError || !adminRole) {
            setError('Unauthorized access.');
            return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            setError(signInError.message);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-black">Blind Admin</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 border rounded-md text-black"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 border rounded-md text-black"
                        required
                    />
                    <button type="submit" className="bg-black text-white p-3 rounded-md font-semibold mt-4 hover:bg-gray-800 transition-colors">
                        Login to Dashboard
                    </button>
                </form>
            </div>
        </main>
    );
}
