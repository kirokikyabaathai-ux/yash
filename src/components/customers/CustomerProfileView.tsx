/**
 * Customer Profile View Component
 * Displays submitted customer profile (read-only)
 */

'use client';

import Link from 'next/link';

interface CustomerProfile {
  id: string;
  user_id?: string;
  lead_id?: string;
  name: string;
  father_name?: string;
  gender?: string;
  address_line_1: string;
  address_line_2?: string;
  pin_code: string;
  state: string;
  district: string;
  account_holder_name: string;
  bank_account_number: string;
  bank_name: string;
  branch_name?: string;
  bank_address?: string;
  ifsc_code: string;
  aadhaar_front_path?: string;
  aadhaar_back_path?: string;
  electricity_bill_path?: string;
  bank_passbook_path?: string;
  cancelled_cheque_path?: string;
  pan_card_path?: string;
  itr_documents_path?: string;
  documents?: Record<string, { fileName: string; fileSize: number; mimeType: string }>;
  created_at: string;
  updated_at: string;
}

interface CustomerProfileViewProps {
  profile: CustomerProfile;
  userRole: string;
}

export function CustomerProfileView({ profile, userRole }: CustomerProfileViewProps) {
  const canEdit = userRole === 'admin';

  // Format date consistently for SSR/CSR
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Submitted on {formatDate(profile.created_at)}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/customer/profile/${profile.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.name}</dd>
          </div>
          {profile.father_name && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Father's Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.father_name}</dd>
            </div>
          )}
          {profile.gender && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{profile.gender}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Address Line 1</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.address_line_1}</dd>
          </div>
          {profile.address_line_2 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address Line 2</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.address_line_2}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Pin Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.pin_code}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">State</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.state}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">District</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.district}</dd>
          </div>
        </dl>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Account Holder Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.account_holder_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Account Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.bank_account_number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.bank_name}</dd>
          </div>
          {profile.branch_name && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Branch Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.branch_name}</dd>
            </div>
          )}
          {profile.bank_address && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Bank Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.bank_address}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile.ifsc_code}</dd>
          </div>
        </dl>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check both old format (path fields) and new format (documents object) */}
          {(profile.aadhaar_front_path || profile.documents?.aadhaar_front) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">Aadhaar Front</span>
                {profile.documents?.aadhaar_front && (
                  <p className="text-xs text-gray-500">{profile.documents.aadhaar_front.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
          {(profile.aadhaar_back_path || profile.documents?.aadhaar_back) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">Aadhaar Back</span>
                {profile.documents?.aadhaar_back && (
                  <p className="text-xs text-gray-500">{profile.documents.aadhaar_back.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
          {(profile.electricity_bill_path || profile.documents?.electricity_bill) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">Electricity Bill</span>
                {profile.documents?.electricity_bill && (
                  <p className="text-xs text-gray-500">{profile.documents.electricity_bill.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
          {(profile.bank_passbook_path || profile.documents?.bank_passbook) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">Bank Passbook</span>
                {profile.documents?.bank_passbook && (
                  <p className="text-xs text-gray-500">{profile.documents.bank_passbook.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
          {(profile.cancelled_cheque_path || profile.documents?.cancelled_cheque) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">Cancelled Cheque</span>
                {profile.documents?.cancelled_cheque && (
                  <p className="text-xs text-gray-500">{profile.documents.cancelled_cheque.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
          {(profile.pan_card_path || profile.documents?.pan_card) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">PAN Card</span>
                {profile.documents?.pan_card && (
                  <p className="text-xs text-gray-500">{profile.documents.pan_card.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
          {(profile.itr_documents_path || profile.documents?.itr_documents) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <span className="text-sm text-gray-700">ITR Documents</span>
                {profile.documents?.itr_documents && (
                  <p className="text-xs text-gray-500">{profile.documents.itr_documents.fileName}</p>
                )}
              </div>
              <span className="text-xs text-green-600">✓ Uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        { userRole != "customer" &&  <Link
          href={profile.lead_id ? `/office/leads/${profile.lead_id}` : '/office/dashboard'}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Lead
        </Link>}
      </div>
    </div>
  );
}
