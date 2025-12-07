/**
 * Bank Letter View Component
 * Displays the formatted bank letter based on form data
 */

'use client';

import React, { useEffect } from 'react';
import type { BankLetterData } from '@/types/bank-letter';

interface Props {
  data: BankLetterData;
}

const BankLetterView: React.FC<Props> = ({ data }) => {
  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #bank-letter-document, #bank-letter-document * {
          visibility: visible;
        }
        #bank-letter-document {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto my-8 shadow-lg print:shadow-none">
      {/* Print Button */}
      <div className="no-print mb-4 flex justify-end">
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
        >
          🖨️ Print Letter
        </button>
      </div>

      <div id="bank-letter-document" className="font-serif leading-relaxed text-black print:p-16 min-h-[1000px]">
        {/* Header */}
        <div className="flex justify-between mb-5">
          <div>To,</div>
          <div>Date : <span className="bg-yellow-100 px-1">{data.date}</span></div>
        </div>

        {/* Recipient Address */}
        <div className="font-bold mb-5">
          <span className="bg-yellow-100 px-1">{data.bankName}</span><br />
          <span className="bg-yellow-100 px-1">{data.bankAddress}</span>
        </div>

        {/* Subject */}
        <div className="font-bold text-center my-8 underline">
          Subject: - Submission of work completion and request for payment
        </div>

        {/* Content Body */}
        <div className="mb-8 text-justify">
          Respected Sir,<br /><br />
          An installation of <span className="bg-yellow-100 px-1">{data.solarCapacity}</span> solar power plant has done in my residence by <strong>GSMR Sales</strong>.<br /><br />
          Please find the attached document for inspection and kindly Disburse the Remaining Amount To vendor (<strong>GSMR Sales</strong>).
        </div>

        {/* Details Table */}
        <div className="mb-8">
          Details are as follows :-
          <table className="w-4/5 mx-auto my-5 border-collapse">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold w-2/5">NAME</td>
                <td className="border border-black p-2">
                  <span className="bg-yellow-100 px-1">{data.applicantName}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">SOLAR CAPACITY</td>
                <td className="border border-black p-2">
                  <span className="bg-yellow-100 px-1">{data.solarCapacity}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">BP. NO.</td>
                <td className="border border-black p-2">
                  <span className="bg-yellow-100 px-1">{data.bpNumber}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Attached Documents */}
        <div className="mb-8">
          Documents are attached here with :-
          <ol className="list-decimal ml-8 mt-2">
            <li>Invoice</li>
            <li>Power Plant Photo</li>
          </ol>
        </div>

        <div className="mb-8">
          Thank You
        </div>

        {/* Signature Section */}
        <div className="mt-12">
          <strong>Applicant</strong><br /><br />
          Name- <span className="bg-yellow-100 px-1">{data.applicantName}</span><br />
          B.P. No.: - <span className="bg-yellow-100 px-1">{data.bpNumber}</span><br />
          Address- <span className="bg-yellow-100 px-1">{data.applicantAddress}</span><br />
          Distt- <span className="bg-yellow-100 px-1">{data.district}</span><br />
          <span className="bg-yellow-100 px-1">{data.stateAndPin}</span><br />
          Mo. <span className="bg-yellow-100 px-1">{data.mobileNumber}</span>
        </div>

        {/* Footer Note */}
        <div className="mt-12 font-bold text-sm border-t border-gray-300 pt-5">
          NOTE :- PLEASE SEND UTR NO. AFTER TRANSFER LOAN AMOUNT IN THE WHATSAPP NO. 8305599008
        </div>
      </div>
    </div>
  );
};

export default BankLetterView;
