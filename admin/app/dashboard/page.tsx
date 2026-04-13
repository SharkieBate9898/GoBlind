export default function DashboardHome() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-700">Total Users on Waitlist</h3>
                    <p className="text-4xl font-bold mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-700">Users Approved</h3>
                    <p className="text-4xl font-bold mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-700">Richmond Users</h3>
                    <p className="text-4xl font-bold mt-2">--</p>
                </div>
            </div>
        </div>
    );
}
