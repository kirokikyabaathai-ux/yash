/**
 * Bank Letter Form Component
 * Converted from bank.html to React
 */

import React, { useState } from 'react';
import type { BankLetterData } from '@/types/bank-letter';

interface Props {
  onSubmit: (data: BankLetterData) => void;
  initialData?: BankLetterData;
}

const BankLetterForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<BankLetterData>(initialData || {
    date: new Date().toLocaleDateString('en-GB'),
    bankName: '',
    bankAddress: '',
    applicantName: '',
    solarCapacity: '',
    bpNumber: '',
    applicantAddress: '',
    district: '',
    stateAndPin: '',
    mobileNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 border-b pb-2">
        Bank Letter - Work Completion & Payment Request
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700">
          Letter Details
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input 
            type="text"
            required 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="DD/MM/YYYY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">BP Number</label>
          <input 
            required 
            name="bpNumber" 
            value={formData.bpNumber} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="1006637898"
          />
        </div>

        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700 mt-2">
          Bank Details
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bank Name & Branch</label>
          <input 
            required 
            name="bankName" 
            value={formData.bankName} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="The SBI MEDICAL COLLEGE (RAIGARH)"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bank Address / City</label>
          <input 
            required 
            name="bankAddress" 
            value={formData.bankAddress} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="SBI Raigarh Dist - Raigarh (C.G.) 496001"
          />
        </div>

        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700 mt-2">
          Applicant Details
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Applicant Name</label>
          <input 
            required 
            name="applicantName" 
            value={formData.applicantName} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Solar Capacity</label>
          <input 
            required 
            name="solarCapacity" 
            value={formData.solarCapacity} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="3kw"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Applicant Address</label>
          <input 
            required 
            name="applicantAddress" 
            value={formData.applicantAddress} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <input 
            required 
            name="district" 
            value={formData.district} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State & Pin Code</label>
          <input 
            required 
            name="stateAndPin" 
            value={formData.stateAndPin} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="Chhattisgarh. 496001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
          <input 
            required 
            name="mobileNumber" 
            value={formData.mobileNumber} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            pattern="[0-9]{10}"
            placeholder="9753265945"
          />
        </div>

        <div className="col-span-1 md:col-span-2 mt-6">
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
          >
            Save Bank Letter
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankLetterForm;
