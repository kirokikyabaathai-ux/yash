import { UserProfileView } from '@/components/profile';
import { PageLayout } from '@/components/layout/PageLayout';

export default function CustomerProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageLayout
          title="My Profile"
          description="View and manage your profile information"
        >
          <UserProfileView />
        </PageLayout>
      </div>
    </div>
  );
}
