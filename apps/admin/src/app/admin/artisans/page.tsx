import AdminHeader from '../../components/AdminHeader';

export const metadata = {
  title: 'Artisans - SHALKAAR Admin',
  description: 'Manage artisan profiles',
};

export default function ArtisansPage() {
  return (
    <>
      <AdminHeader
        title="Artisans"
        description="Manage artisan profiles and content"
      />
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Artisans List</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-gray-600">
            Artisans management module is coming soon.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Once the artisans API endpoint is available, this page will display and manage artisan profiles.
          </p>
        </div>
      </div>
    </>
  );
}
