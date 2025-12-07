/**
 * PPA (Power Purchase Agreement) Form Component
 * Converted from PPA.html to React
 */

import React, { useState } from 'react';
import type { PPAData } from '@/types/ppa';

interface Props {
  onSubmit: (data: PPAData) => void;
  initialData?: PPAData;
}

const PPAForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<PPAData>(initialData || {
    agreementDate: '',
    consumerId: '',
    prosumerName: '',
    fatherName: '',
    village: '',
    district: '',
    state: '',
    pinCode: '',
    plantCapacity: '',
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
        Power Purchase Agreement (PPA) - RTS Plants
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700">
          Agreement Details
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Agreement Date</label>
          <input 
            type="date"
            required 
            name="agreementDate" 
            value={formData.agreementDate} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Consumer ID / BP No</label>
          <input 
            required 
            name="consumerId" 
            value={formData.consumerId} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="e.g., 1002794244"
          />
        </div>

        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700 mt-2">
          Prosumer Details
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prosumer Name</label>
          <input 
            required 
            name="prosumerName" 
            value={formData.prosumerName} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Father's Name</label>
          <input 
            required 
            name="fatherName" 
            value={formData.fatherName} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="Shree..."
          />
        </div>

        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700 mt-2">
          Address Details
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Village / Address Line 1</label>
          <input 
            required 
            name="village" 
            value={formData.village} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="Vill. Tangarghat"
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
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input 
            required 
            name="state" 
            value={formData.state} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="CHHATTISGARH"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PIN Code</label>
          <input 
            required 
            name="pinCode" 
            value={formData.pinCode} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            pattern="[0-9]{6}"
            placeholder="496107"
          />
        </div>

        <div className="col-span-1 md:col-span-2 bg-blue-50 p-3 rounded font-semibold text-gray-700 mt-2">
          Plant Specifications
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Plant Capacity (kWp)</label>
          <input 
            required 
            name="plantCapacity" 
            value={formData.plantCapacity} 
            onChange={handleChange} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            placeholder="3.00"
            step="0.01"
            type="number"
          />
        </div>

        <div className="col-span-1 md:col-span-2 mt-6">
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
          >
            Save PPA Agreement
          </button>
        </div>
      </form>
    </div>
  );
};

export default PPAForm;
