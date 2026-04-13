"use client";
import { useState } from 'react';
import { supabase } from '../src/lib/supabase';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleWaitlistSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setStatus('error');
            setMessage(authError.message);
            return;
        }

        if (!authData.user) {
            setStatus('error');
            setMessage('An unknown error occurred.');
            return;
        }

        // 2. Add to users table (Waitlist logic handled mostly by default values or triggers)
        const accessStatus = city.toLowerCase().includes('richmond') ? 'waitlisted' : 'waitlisted'; // All waitlisted initially until approved

        // Note: Due to RLS or Triggers, the user row might be created automatically. 
        // We update the row to save location information.
        const { error: dbError } = await supabase.from('users').upsert({
            id: authData.user.id,
            email: email,
            launch_city: city,
            access_status: accessStatus,
            date_of_birth: new Date(2000, 1, 1).toISOString(), // Dummy for landing, full onboarding in mobile
        });

        if (dbError) {
            console.error(dbError);
        }

        setStatus('success');
        if (city.toLowerCase().includes('richmond')) {
            setMessage("You're early — Blind is launching first in Richmond. We'll notify you when you are approved.");
        } else {
            setMessage("Blind is launching city by city. You're on the waitlist and we'll notify you when Blind launches in your area.");
        }
    };

    return (
        <main className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
            <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col md:flex-row gap-16 items-center">

                <div className="flex-1 space-y-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Blind</h1>
                    <p className="text-2xl font-light text-stone-600 leading-relaxed">
                        A text-first dating app where people connect based on values, personality, and life goals before appearance.
                    </p>
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Launch City</h3>
                        <p className="text-lg font-medium">Currently launching exclusively in Richmond, VA.</p>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50">
                    <h2 className="text-2xl font-bold mb-6">Join the Waitlist</h2>

                    {status === 'success' ? (
                        <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                            <p className="text-stone-800 font-medium leading-relaxed">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleWaitlistSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="hello@example.com"
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    placeholder="e.g. Richmond, VA"
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                                    required
                                />
                            </div>

                            {status === 'error' && <p className="text-red-500 text-sm">{message}</p>}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-stone-900 text-white rounded-lg font-semibold tracking-wide hover:bg-stone-800 transition-colors disabled:opacity-70 mt-4">
                                {status === 'loading' ? 'Joining...' : 'Get Early Access'}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </main>
    );
}
