"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';

export default function AdminsManagement() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [isSuper, setIsSuper] = useState(false);

    const fetchAdmins = async () => {
        // Check if we have permission first via super_admin logic
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user.email === 'jjx2121@gmail.com') {
            setIsSuper(true);
            const { data } = await supabase.from('admin_roles').select('*');
            if (data) setAdmins(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const addAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;

        // In a real app we might need to invoke a Supabase edge function to create the Auth user
        // or assume they will sign up via an invite link. We'll simply insert the role for now.
        // Assuming they use sign up via auth or we know their UID. 
        // Wait, we need their user_id to insert into admin_roles.
        alert('This is a stub: Would invoke Supabase Edge Function to invite user and assign role.');

        setNewEmail('');
    };

    if (loading) return <div>Loading...</div>;

    if (!isSuper) {
        return <div className="text-red-500">Access Denied: Super Admin only.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Admins</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
                <form onSubmit={addAdmin} className="flex gap-4">
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="flex-1 p-3 border rounded-md"
                        required
                    />
                    <button type="submit" className="bg-black text-white px-6 py-3 rounded-md font-semibold">
                        Invite Admin
                    </button>
                </form>
            </div>

            <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Role</th>
                            <th className="p-4 font-semibold text-gray-600">Added Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 text-gray-800">{admin.email}</td>
                                <td className="p-4 text-gray-600">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{new Date(admin.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {admins.length === 0 && (
                            <tr className="border-b">
                                <td className="p-4 text-gray-800">jjx2121@gmail.com</td>
                                <td className="p-4 text-gray-600">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        super_admin
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">Pre-seeded</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
