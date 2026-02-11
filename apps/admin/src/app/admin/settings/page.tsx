import AdminHeader from '../../components/AdminHeader';
import AdminOnly from '@/components/AdminOnly';

export const metadata = {
  title: 'Settings - SHALKAAR Admin',
  description: 'Manage admin settings',
};

export default function SettingsPage() {
  return (
    <AdminOnly>
      <>
        <AdminHeader
          title="Settings"
          description="Manage store settings and configuration"
        />
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Settings</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    placeholder="SHALKAAR"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Currency
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled
                  >
                    <option>USD</option>
                    <option>PKR</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Settings
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h2>
              <p className="text-sm text-gray-700">
                This page is restricted to admin users only. Staff members will be redirected to the dashboard.
              </p>
            </div>
          </div>
        </div>
      </>
    </AdminOnly>
  );
}
