import { QuotationData } from '@/types/quotation';
import React from 'react';


interface PageProps {
  data: QuotationData;
}

const QuotationView: React.FC<PageProps> = ({ data }) => {
  return (
    <div id="quotation-content" className="text-black font-sans text-[11px] leading-tight w-full">
      {/* --- HEADER SECTION --- */}
      <div className="bg-[#92d050] border border-black p-2 mb-1">
        <div className="flex justify-between text-[10px] font-bold mb-2 text-black">
          <span>REG.NO.:- U78300CT2025PTC018584</span>
          <a href="http://www.yasnatural.com" className="text-black underline">www.yasnatural.com</a>
          <span>GST NO.:- 22AACCY0651Q1Z4</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-24 h-24 bg-yellow-300 rounded-full flex items-center justify-center border-2 border-white relative shrink-0 mr-4 shadow-sm">
            <div className="absolute top-2 text-black font-bold text-xs">YAS</div>
            <svg viewBox="0 0 100 100" className="w-full h-full p-2">
               <path d="M20,60 Q50,10 80,60" fill="none" stroke="green" strokeWidth="3" />
               <path d="M30,70 L50,40 L70,70" fill="none" stroke="green" strokeWidth="2" />
               <circle cx="50" cy="30" r="5" fill="green" />
            </svg>
          </div>

          <div className="flex-grow text-center text-black">
            <h1 className="text-2xl font-black leading-tight">
              YAS NATURAL PRODUCTION & MANAGEMENT SERVICES
              <br />
              PRIVATE LIMITED
            </h1>
            <p className="text-xs font-bold mt-1">
              Add : - MIG-09, Housing Board Colony, Near Raigarh Stadium, Chakradhar Nagar Raigarh (C.G.)
            </p>
            <p className="text-xs font-bold">
              Mobil - 9827982630, 9893588109, Email - suriyaaps7@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* --- TITLE BANNERS --- */}
      <div className="border border-black text-center font-bold text-sm bg-white text-black mb-0.5 py-1">
        {data.capacity} KWP SOLAR ROOFTOP ON -GRID POWER PLANT SYSTEM"
      </div>
      <div className="border border-black text-center font-bold text-sm bg-white text-black mb-0.5 py-1">
        "PM SURYA GHAR MUFT BIJLI YOJNA"
      </div>

      {/* --- CUSTOMER DETAILS TABLE --- */}
      <table className="mb-2 w-full border-collapse border border-black text-black">
        <tbody>
          <tr className="bg-[#fce5cd]">
            <td className="w-1/4 font-bold border border-black p-1">Customer Name</td>
            <td className="font-bold border border-black p-1">{data.customerName}</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Address</td>
            <td className="font-bold border border-black p-1">{data.address}</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Cunsumer Contact No.</td>
            <td className="font-bold border border-black p-1">{data.contactNo}</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Application Number</td>
            <td className="font-bold border border-black p-1">{data.applicationNumber}</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Consumer Number</td>
            <td className="font-bold border border-black p-1">{data.consumerNumber}</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Description</td>
            <td className="font-bold border border-black p-1">praposal for installation of on grid solar plant systam</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Proposed Capacity</td>
            <td className="font-bold border border-black p-1">{data.capacity} &nbsp;&nbsp;&nbsp; KWP</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Date Of Proposal</td>
            <td className="font-bold border border-black p-1">{data.date}</td>
          </tr>
          <tr className="bg-[#fce5cd]">
            <td className="font-bold border border-black p-1">Proposal Quotation No.</td>
            <td className="font-bold border border-black p-1">{data.quotationNo}</td>
          </tr>
        </tbody>
      </table>

      {/* --- TECHNICAL PROPOSAL HEADERS --- */}
      <div className="text-center py-2 text-black">
        <h2 className="font-bold text-sm">Technical Proposal</h2>
        <h3 className="font-medium text-xs">Working Principle Of On Grid Connected Solar Project:-</h3>
        <h3 className="font-bold text-xs mt-1">Technical Details - Project Specification</h3>
        <p className="text-xs text-left pl-1 mt-1">Area Wise Capacity Bifurcation :-</p>
      </div>

      {/* --- CAPACITY BIFURCATION TABLE --- */}
      <table className="mb-4 text-center w-full border-collapse border border-black text-black">
        <thead>
          <tr className="bg-[#93c47d]">
            <th colSpan={6} className="font-bold border border-black p-1">Area Wise Capacity bifurcation {data.areaCapacity}</th>
          </tr>
          <tr className="bg-white">
            <th className="w-10 border border-black p-1">Sr.No.</th>
            <th className="border border-black p-1">Site Location</th>
            <th className="border border-black p-1">Building /area<br/>Name</th>
            <th className="border border-black p-1">Rooftop /<br/>Ground Mounting</th>
            <th className="border border-black p-1">Installation Type</th>
            <th className="border border-black p-1">Capacity (kwp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-[#b6d7a8]">
            <td className="border border-black p-1">1,</td>
            <td className="border border-black p-1">{data.siteLocation}</td>
            <td className="border border-black p-1">domastic</td>
            <td className="border border-black p-1">Roof-top</td>
            <td className="border border-black p-1">Roof-top</td>
            <td className="border border-black p-1">{data.capacityKwp}</td>
          </tr>
        </tbody>
      </table>

      {/* --- SCOPE MATRIX TABLE (Merged) --- */}
      <table className="mb-4 w-full border-collapse border border-black text-black">
        <thead>
          <tr className="bg-[#93c47d]">
            <th colSpan={4} className="text-center font-bold border border-black p-1">SCOPE MATRIX</th>
          </tr>
          <tr>
            <th colSpan={2} className="text-center font-bold border border-black p-1">Description</th>
            <th colSpan={2} className="text-center font-bold border border-black p-1">Scope Work</th>
          </tr>
          <tr>
            <th colSpan={2} className="border border-black p-1"></th>
            <th className="w-32 text-center font-bold text-[10px] border border-black p-1">YAS NATURAL<br/>PRODUCIOTN</th>
            <th className="w-32 text-center font-bold text-[10px] border border-black p-1">CLIENT</th>
          </tr>
        </thead>
        <tbody>
          {/* Section 1 */}
          <tr className="bg-[#b6d7a8]">
            <td className="w-10 text-center font-bold border border-black p-1">1,</td>
            <td colSpan={3} className="font-bold pl-2 border border-black p-1">Design, Supply, Installation, Testing & Commissioning</td>
          </tr>
          
          {/* Rows A-I */}
          <tr>
            <td className="text-center align-top border border-black p-1">A,</td>
            <td className="pl-2 border border-black p-1">
              To conduct a detailed site visit with specialists to take accurate<br/>
              Measurements, photographs, and other site-specifice<br/>
              Information for full design.
            </td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">B,</td>
            <td className="pl-2 border border-black p-1">
              Prepare full system design to include civil, structural, electrical<br/>
              And mechanical components, with construcation drawings and<br/>
              Specifications.
            </td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">C,</td>
            <td className="pl-2 border border-black p-1">Procure equipment and materials and deliver to site.</td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">D,</td>
            <td className="pl-2 border border-black p-1">Perform complete system installation.</td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">E,</td>
            <td className="pl-2 border border-black p-1">
              Test all electrical components in accordance with manufacturer<br/>
              Instructions.
            </td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">F,</td>
            <td className="pl-2 border border-black p-1">
              Liasoning work and Net-Metering & calibrationfees to get the<br/>
              Net-Metering from DISCOM.
            </td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
           <tr>
            <td className="text-center align-top border border-black p-1">G,</td>
            <td className="pl-2 border border-black p-1">
              Cleaning system of the panel (like motor, sprinkles and pipe<br/>
              with fitting).
            </td>
            <td className="text-center font-bold border border-black p-1"></td>
            <td className="text-center font-bold border border-black p-1">P</td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">H,</td>
            <td className="pl-2 border border-black p-1">Lodging,Transport&Fooding for work crew outside the premises</td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">I,</td>
            <td className="pl-2 border border-black p-1">Commission the system to full operability.</td>
            <td className="text-center font-bold border border-black p-1">P</td>
            <td className="border border-black p-1"></td>
          </tr>

          {/* Section 2 */}
          <tr className="bg-[#b6d7a8]">
            <td className="text-center font-bold border border-black p-1">2,</td>
            <td colSpan={3} className="font-bold pl-2 border border-black p-1">Clients Scope</td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">A,</td>
            <td className="pl-2 border border-black p-1">
              Provide access tp the work site for delivery of equipment and<br/>
              Materials prior to and during project implementation.
            </td>
            <td className="border border-black p-1"></td>
            <td className="text-center font-bold border border-black p-1">P</td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">B,</td>
            <td className="pl-2 border border-black p-1">
              Approval of full system design include civil,structural,Electrical<br/>
              and Mechanical Components, with construcation drawings and specifications.
            </td>
            <td className="border border-black p-1"></td>
            <td className="text-center font-bold border border-black p-1">P</td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">C,</td>
            <td className="pl-2 border border-black p-1">
              Provide a suitable and secure space for storage of equipment<br/>
              and materials.
            </td>
            <td className="border border-black p-1"></td>
            <td className="text-center font-bold border border-black p-1">P</td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">E,</td>
            <td className="pl-2 border border-black p-1">or consultation as needed.</td>
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">F,</td>
            <td className="pl-2 border border-black p-1">
              Post project commissioning & handover, weekly cleaning of<br/>
              Solar modules via cleaning arrangement.
            </td>
            <td className="border border-black p-1"></td>
            <td className="text-center font-bold border border-black p-1">P</td>
          </tr>
          <tr>
            <td className="text-center align-top border border-black p-1">G,</td>
            <td className="pl-2 border border-black p-1">
              Ensure the in wards of the material via Gate pass in the premises<br/>
              At 6their entry point and exit of equipment with work crew via<br/>
              Gate pass at Exit point.
            </td>
            <td className="border border-black p-1"></td>
            <td className="text-center font-bold border border-black p-1">P</td>
          </tr>
        </tbody>
      </table>

      {/* --- DETAILED BILL OF MATERIAL (BOM) --- */}
      <h3 className="font-bold text-xs mb-1 text-black">DETAILED BILL OF MATERIAL (BOM)</h3>
      <table className="mb-4 text-center text-[10px] w-full border-collapse border border-black text-black">
        <thead>
            <tr className="bg-[#93c47d]">
                <th className="w-10 border border-black p-1">S.No.</th>
                <th className="border border-black p-1">Component</th>
                <th className="border border-black p-1">Description</th>
                <th className="border border-black p-1">Quantity</th>
                <th className="border border-black p-1">Make</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border border-black p-1">1,</td>
                <td className="border border-black p-1">
                    PV Modules 535/550<br/>
                    Mono Crystalline<br/>
                    Bifacial
                </td>
                <td className="border border-black p-1">
                    IEC61215/ISI4286/ICE61730-<br/>
                    Part-1forConstruction, Part2<br/>
                    for Testing/Safety, IEC 61701.
                </td>
                <td className="font-bold border border-black p-1">{data.pvQuantity}</td>
                <td className="border border-black p-1">adani/ tata/waari /nova</td>
            </tr>
            <tr>
                <td className="border border-black p-1">2,</td>
                <td className="border border-black p-1">
                    On Grid Inverter 3kw<br/>
                    MPPT
                </td>
                <td className="border border-black p-1">
                    Inverter shall comply with<br/>
                    IEC/equivalent BIS standard<br/>
                    for efficiency measurements<br/>
                    40% Overload and<br/>
                    Environmental tests as per IEC<br/>
                    61683/IS 61683 and IEC 60068
                </td>
                <td className="border border-black p-1">1Set</td>
                <td className="border border-black p-1">
                    adani / tata waari<br/>
                    STATCON
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">3,</td>
                <td className="border border-black p-1">
                    Module Mounting<br/>
                    Structure
                </td>
                <td className="border border-black p-1">
                    Pre-Galvanized (80+ micron)<br/>
                    Panel Mounting structure, to<br/>
                    sustain 150km/hr. windspeed
                </td>
                <td className="border border-black p-1">
                    As per site<br/>
                    Design
                </td>
                <td className="border border-black p-1">Reputed Make</td>
            </tr>
             <tr>
                <td className="border border-black p-1">4,</td>
                <td className="border border-black p-1">ACDB/DCDB</td>
                <td className="border border-black p-1">
                    Inverter combining box with<br/>
                    4 pole MCCB with IP65<br/>
                    protection with indication<br/>
                    lamp and accessories
                </td>
                <td className="border border-black p-1">2set</td>
                <td className="border border-black p-1">
                    MCCB<br/>
                    Schneider/C&S<br/>
                    L&T/ABB or<br/>
                    equivalent
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">5,</td>
                <td className="border border-black p-1">Earthing Protection</td>
                <td className="border border-black p-1">
                    Chemical Earthing with<br/>
                    2 copper rod, chemical<br/>
                    compound & Earth pit cover as<br/>
                    per IS 3043:1987
                </td>
                <td className="border border-black p-1">1set</td>
                <td className="border border-black p-1">
                    SABO/PROTECH<br/>
                    TRUEPOWER<br/>
                    Or<br/>
                    Equivalent
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">6,</td>
                <td className="border border-black p-1">Lightning Protection</td>
                <td className="border border-black p-1">
                    ESE based lightning with down<br/>
                    Conductor arrestor to cover<br/>
                    entire installation area.
                </td>
                <td className="border border-black p-1">1set</td>
                <td className="border border-black p-1">
                    TRUEPOWER<br/>
                    / SABO Or<br/>
                    Equivalent
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">7,</td>
                <td className="border border-black p-1">
                    MC4 Connector Pair<br/>
                    Male & Female
                </td>
                <td className="border border-black p-1">IP68, TUV Certified</td>
                <td className="border border-black p-1">
                    Asper<br/>
                    Design
                </td>
                <td className="border border-black p-1">
                    Elmex/ phonix/<br/>
                    Equivalent
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">8,</td>
                <td className="border border-black p-1">DC Cables</td>
                <td className="border border-black p-1">
                    DC:4mm26mm2Annealed<br/>
                    Tinned copper UV resistance
                </td>
                <td className="border border-black p-1">
                    Asper<br/>
                    Design max 12<br/>
                    mi.
                </td>
                <td className="border border-black p-1">
                    Polycab/Siechem/KEI<br/>
                    /Delton/ Equivalent
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">9,</td>
                <td className="border border-black p-1">AC Cables</td>
                <td className="border border-black p-1">
                    All based as per design<br/>
                    Requirement
                </td>
                <td className="border border-black p-1">
                    Asper<br/>
                    Design max 30<br/>
                    mi.
                </td>
                <td className="border border-black p-1">
                    polycab/Havells/KEI /radas<br/>
                    /Delton/ Equivalent
                </td>
            </tr>
             <tr>
                <td className="border border-black p-1">10,</td>
                <td className="border border-black p-1">Other Accessories</td>
                <td className="border border-black p-1">
                    TieCable,Lugs,Shaddle,PVC<br/>
                    Conduit,Flexiblepipe.
                </td>
                <td className="border border-black p-1">
                    Asper<br/>
                    Design
                </td>
                <td className="border border-black p-1">Standard Make</td>
            </tr>
        </tbody>
      </table>

      {/* --- TECHNO COMMERCIAL OFFER --- */}
      <h3 className="font-bold text-xs mb-1 text-black">Techno Commercal Offer</h3>
      <table className="mb-4 text-[10px] w-full border-collapse border border-black text-black">
        <thead>
            <tr className="bg-[#93c47d]">
                <th className="w-10 border border-black p-1">S.No.</th>
                <th className="border border-black p-1">PRODUCT DESCRIPTION</th>
                <th className="w-24 border border-black p-1">UNIT PRICE</th>
                <th className="w-32 border border-black p-1">VALUE IN (INR.)</th>
            </tr>
        </thead>
        <tbody>
            {/* 1 */}
            <tr>
                <td className="text-center font-bold border border-black p-1">1,</td>
                <td className="pl-2 border border-black p-1">
                    <span className="font-bold">Supply of &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {data.capacity} KW &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; On Grid Solar System</span><br/>
                    (includes Solar PV Modules, Grid Tied Inverter, Mounting<br/>
                    Structures, Cables,Earthing,Connectors,Junction Boxes, etc.)<br/>
                    Installation & Commissioning.
                </td>
                <td rowSpan={4} className="border border-black p-1"></td>
                <td className="text-center font-bold border border-black p-1">{data.systemCost}</td>
            </tr>
            {/* 2 */}
            <tr>
                <td className="text-center font-bold border border-black p-1">2,</td>
                <td className="pl-2 font-bold border border-black p-1">
                    Subsidy on National Portal &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {data.subsidyAmount} &nbsp; in applicant AC
                </td>
                <td className="text-center font-bold border border-black p-1">{data.subsidyAmount}</td>
            </tr>
            {/* 3 */}
            <tr>
                <td className="text-center font-bold border border-black p-1">3,</td>
                <td className="pl-2 font-bold border border-black p-1">
                    NET Metering, Testing, Installation at TPCODL@ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {data.netMeteringIncluded}
                </td>
                 <td className="bg-gray-200 border border-black p-1"></td>
            </tr>
            {/* 4 */}
            <tr>
                <td className="text-center font-bold border border-black p-1">4,</td>
                <td className="pl-2 font-bold border border-black p-1">
                    Total System Cost Paid by Client
                </td>
                <td className="text-center font-bold border border-black p-1">{data.totalCost}</td>
            </tr>
             {/* Total Words */}
             <tr>
                 <td colSpan={4} className="pl-2 font-bold py-2 border border-black p-1">
                 IN WORD:- {data.amountInWords}
                 </td>
             </tr>
        </tbody>
      </table>

      {/* --- TERMS & CONDITIONS --- */}
      <div>
        <h3 className="font-bold text-xs mb-1 text-black">TERMS & CONDITIONS:-</h3>
        
        <table className="mb-4 text-[10px] w-full border-collapse border border-black text-black">
          <tbody>
            <tr className="border-b border-black">
              <td className="bg-[#93c47d] w-32 font-bold align-top border border-black p-1">
                Warranty &<br/>Servicing
              </td>
              <td className="p-0 border border-black">
                  <div className="flex border-b border-gray-300 p-1">
                    <span className="w-6">→</span>
                    <div><span className="font-bold">PV MODULES:</span> 25 Years Linear Power as per policy.</div>
                  </div>
                  <div className="flex border-b border-gray-300 p-1">
                    <span className="w-6">→</span>
                    <div><span className="font-bold">SOLAR INVERTER:</span> 7 - 8 Years as per policy.</div>
                  </div>
                  <div className="flex border-b border-gray-300 p-1">
                    <span className="w-6">→</span>
                    <div><span className="font-bold">OTHER ACCESSORIES:</span> as per manufacturer's warranty.</div>
                  </div>
                  <div className="flex border-b border-gray-300 p-1">
                    <span className="w-6">→</span>
                    <div>Applicable from the date of invoices per+ manufacturer T&C.</div>
                  </div>
                  <div className="flex border-b border-gray-300 p-1">
                    <span className="w-6">→</span>
                    <div>Bill copy necessary for claiminig warranty.</div>
                  </div>
                  <div className="flex p-1">
                    <span className="w-6">→</span>
                    <div>We shall assist in raising service request and coordinating claims with<br/>The manufacturer.</div>
                  </div>
              </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Transportation &<br/>Insurance
                </td>
                <td className="p-0 border border-black">
                    <div className="flex border-b border-gray-300 p-1">
                        <span className="w-6">→</span>
                        <div>By Road Transport to your site</div>
                    </div>
                    <div className="flex p-1">
                        <span className="w-6">→</span>
                        <div>Transit insurance to be done on Demand - Charges payable Extra</div>
                    </div>
                </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Payment Terms
                </td>
                <td className="p-0 border border-black">
                    <div className="flex border-b border-gray-300 p-1">
                        <span className="w-6">→</span>
                        <div>90% Advance along with purchase order or order confirmation.</div>
                    </div>
                    <div className="flex p-1">
                        <span className="w-6">→</span>
                        <div>10% After successful installation of project.</div>
                    </div>
                </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Mode Of Payment
                </td>
                <td className="p-1 flex border border-black">
                    <span className="w-6">→</span>
                    <div>A/C</div>
                </td>
            </tr>
            
            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Finance Facility
                </td>
                <td className="p-1 flex border border-black">
                    <span className="w-6">→</span>
                    <div>Bank Finance upto 100% Of Project cost.</div>
                </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Subsidy Terms
                </td>
                <td className="p-1 border border-black">
                    The responsibility of the amount of Subsidy depends on the policy of the<br/>
                    Central And state. The supplier Agency will not responsible for it.
                </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Variation
                </td>
                <td className="p-1 border border-black">
                    Revision or addition beyond commitment in the product Specifications/<br/>
                    Scope Due to site requirement (within the project capacity targets), well be<br/>
                    At the sole discretion of <span className="font-bold">YAS NATURAL PRODUCTION & MANAGEMENT SERVICES Pvt. Ltd.</span> And the cost of the same<br/>
                    Shall Be adjustedin the invoice accordingly. After designing the System,<br/>
                    The capacity variation cost shall be considered for any changes.
                </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    Consumables
                </td>
                <td className="p-1 border border-black">
                    Consumables like SPD, Fuses,Nut-Bolt, and Fasteners etc. are not covered<br/>
                    Under any warranty And will not be replaced.
                </td>
            </tr>

            <tr className="border-b border-black">
                <td className="bg-[#93c47d] font-bold align-top border border-black p-1">
                    OtherTerm<br/>
                    Sand Conditions
                </td>
                <td className="p-0 border border-black">
                    <div className="flex border-b border-gray-300 p-1">
                        <span className="w-6">→</span>
                        <div>Quotation validity: 15Days</div>
                    </div>
                    <div className="flex border-b border-gray-300 p-1">
                        <span className="w-6">→</span>
                        <div>Price sare for site (Supply,Installation, Testing and Commissioning)</div>
                    </div>
                    <div className="flex border-b border-gray-300 p-1">
                        <span className="w-6">→</span>
                        <div>2%interest penalty (Per Month) Shall be charged for overdue amount.</div>
                    </div>
                    <div className="flex p-1">
                        <span className="w-6">→</span>
                        <div>Transportation and Freight Exclusive.</div>
                    </div>
                </td>
            </tr>
          </tbody>
        </table>

        {/* --- BANK DETAILS & FOOTER --- */}
        <h3 className="font-bold text-sm mb-1 uppercase text-black">BANK DETAILS</h3>
        <div className="flex">
            {/* Bank Table */}
            <div className="w-1/2">
                <table className="text-[11px] font-bold w-full border-collapse border border-black text-black">
                    <tbody>
                        <tr>
                            <td className="bg-white border border-black p-1">Bank Name</td>
                            <td className="bg-white border border-black p-1 text-center">HDFC BANK</td>
                        </tr>
                        <tr>
                            <td className="bg-white border border-black p-1">Account Number</td>
                            <td className="bg-white border border-black p-1 text-center">50200114681516</td>
                        </tr>
                        <tr>
                            <td className="bg-white border border-black p-1">IFSC Code</td>
                            <td className="bg-white border border-black p-1 text-center">HDFC0005081</td>
                        </tr>
                        <tr>
                            <td className="bg-white border border-black p-1">Bank Branch</td>
                            <td className="bg-white border border-black p-1 text-center">Gaurishankar Chowk Raigarh (C.G.)</td>
                        </tr>
                        <tr>
                            <td className="bg-white border border-black p-1">Company Name</td>
                            <td className="bg-white border border-black p-1 text-center">YAS NATURAL PRODUCTION & MANAGEMENT SERVICES<br/>PRIVATE LIMITED</td>
                        </tr>
                        <tr>
                            <td className="bg-white border border-black p-1">GST Number</td>
                            <td className="bg-yellow-200 border border-black p-1 text-center">22AACCY0651Q1Z4</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Stamp and Signature Area */}
            <div className="w-1/2 flex flex-col items-center justify-end relative">
                 <div className="relative mb-2">
                     <svg width="120" height="120" viewBox="0 0 120 120">
                         {/* Stamp Circle */}
                         <circle cx="60" cy="60" r="50" fill="none" stroke="#3730a3" strokeWidth="2" />
                         <circle cx="60" cy="60" r="35" fill="none" stroke="#3730a3" strokeWidth="1" />
                         
                         {/* Path for text */}
                         <defs>
                             <path id="circlePath" d="M 15,60 A 45,45 0 1,1 105,60 A 45,45 0 1,1 15,60" />
                             <path id="innerPath" d="M 30,60 A 30,30 0 1,0 90,60 A 30,30 0 1,0 30,60" />
                         </defs>
                         
                         <text fontSize="5.5" fontWeight="bold" fill="#3730a3">
                             <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                                YAS NATURAL PRODUCTION & MANAGEMENT SERVICES PVT. LTD.
                             </textPath>
                         </text>
                         
                         {/* Signature Approximation */}
                         <path d="M40,65 Q50,45 60,65 T80,55" stroke="#3730a3" strokeWidth="2" fill="none" />
                         <path d="M45,75 Q60,85 75,70" stroke="#3730a3" strokeWidth="1" fill="none" />
                     </svg>
                 </div>
                 <div className="font-bold text-center text-xs text-black">Thanks & regards</div>
                 <div className="text-[8px] font-bold mt-1 text-center text-black">YAS NATURAL PRODUCTION & MANAGEMENT SERVICES PRIVATE LIMITED</div>
            </div>
        </div>

        {/* Footer Yellow Note */}
        <div className="mt-2 bg-yellow-300 border border-black p-1 text-center font-bold text-xs text-black">
            Note:- Please sent UTR no. after transfer loan on whatsapp no.-<br/>
            9827982630
        </div>
      </div>
    </div>
  );
};

export default QuotationView;