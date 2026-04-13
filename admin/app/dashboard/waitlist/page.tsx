"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';

export default function WaitlistManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWaitlist = async () => {
        const { data } = await supabase
            .from('users')
            .select('id, email, access_status, waitlist_position, launch_city, created_at')
            .order('waitlist_position', { ascending: true });

        if (data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const updateStatus = async (userId: string, status: string) => {
        const { data: { session } } = await supabase.auth.getSession();

        let adminRoleResp = await supabase.from('admin_roles').select('id').eq('user_id', session?.user.id).single();
        let approvedById = adminRoleResp?.data?.id;

        await supabase.from('users').update({
            access_status: status,
            approved_at: status === 'approved' ? new Date().toISOString() : null,
            approved_by: approvedById || null
        }).eq('id', userId);

        fetchWaitlist();
    };

    if (loading) return <div>Loading waitlist...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Waitlist Management</h1>
            <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Pos</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">City</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 text-gray-700">#{user.waitlist_position}</td>
                                <td className="p-4 text-gray-800">{user.email}</td>
                                <td className="p-4 text-gray-600">{user.launch_city || 'N/A'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${user.access_status === 'approved' ? 'bg-green-100 text-green-700' :
                                            user.access_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {user.access_status}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => updateStatus(user.id, 'approved')}
                                        disabled={user.access_status === 'approved'}
                                        className="px-3 py-1 bg-black text-white rounded text-sm disabled:opacity-50">
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => updateStatus(user.id, 'rejected')}
                                        disabled={user.access_status === 'rejected'}
                                        className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm disabled:opacity-50">
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
