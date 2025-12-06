import { QuotationData } from '@/types/quotation';
import React, { useState } from 'react';


interface Props {
  onSubmit: (data: QuotationData) => void;
}

const QuotationForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<QuotationData>();

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
      <h2 className="text-2xl font-bold mb-6 text-green-700 border-b pb-2">Create New Quotation</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="col-span-1 md:col-span-2 bg-gray-50 p-3 rounded font-semibold text-gray-700">Customer Details</div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input required name="customerName" value={formData.customerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact No.</label>
          <input required name="contactNo" value={formData.contactNo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input required name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div className="col-span-1 md:col-span-2 bg-gray-50 p-3 rounded font-semibold text-gray-700 mt-2">Application Details</div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Application Number</label>
          <input required name="applicationNumber" value={formData.applicationNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Consumer Number</label>
          <input required name="consumerNumber" value={formData.consumerNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Proposal</label>
          <input type="date" required name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Proposal Quotation No.</label>
          <input required name="quotationNo" value={formData.quotationNo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div className="col-span-1 md:col-span-2 bg-gray-50 p-3 rounded font-semibold text-gray-700 mt-2">Technical & Site Specs</div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Proposed Capacity (KWP)</label>
          <input required name="capacity" value={formData.capacity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Site Location</label>
          <input required name="siteLocation" value={formData.siteLocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Area Wise Capacity (Header)</label>
           <input required name="areaCapacity" value={formData.areaCapacity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Capacity (Table Column)</label>
           <input required name="capacityKwp" value={formData.capacityKwp} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">PV Modules Quantity</label>
           <input required name="pvQuantity" value={formData.pvQuantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div className="col-span-1 md:col-span-2 bg-gray-50 p-3 rounded font-semibold text-gray-700 mt-2">Commercials</div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supply Cost (Base System)</label>
          <input required name="systemCost" value={formData.systemCost} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subsidy Amount</label>
          <input required name="subsidyAmount" value={formData.subsidyAmount} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Net Metering Status</label>
          <input required name="netMeteringIncluded" value={formData.netMeteringIncluded} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total System Cost Paid by Client</label>
          <input required name="totalCost" value={formData.totalCost} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Total Amount in Words</label>
          <input required name="amountInWords" value={formData.amountInWords} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div className="col-span-1 md:col-span-2 mt-6">
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200">
            Generate Quotation
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;