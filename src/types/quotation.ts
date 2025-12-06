export interface QuotationData {
  customerName: string;
  address: string;
  contactNo: string;
  applicationNumber: string;
  consumerNumber: string;
  capacity: string;
  date: string;
  quotationNo: string;
  siteLocation: string;
  areaCapacity: string; // For the "Area Wise Capacity bifurcation #REF!"
  capacityKwp: string; // For the table column
  pvQuantity: string; // BOM Item 1 Quantity
  systemCost: string;
  subsidyAmount: string;
  netMeteringIncluded: string; // e.g. "INCLUDED" or amount
  totalCost: string;
  amountInWords: string;
}

export const defaultQuotationData: QuotationData = {
  customerName: "John Doe",
  address: "123 Solar Street, Raipur",
  contactNo: "9876543210",
  applicationNumber: "APP-2023-001",
  consumerNumber: "CONS-999888",
  capacity: "5",
  date: new Date().toISOString().split('T')[0],
  quotationNo: "YAS/QT/2023/001",
  siteLocation: "Raipur",
  areaCapacity: "5KW",
  capacityKwp: "5",
  pvQuantity: "9 Nos",
  systemCost: "350000",
  subsidyAmount: "78000",
  netMeteringIncluded: "INCLUDED",
  totalCost: "272000",
  amountInWords: "Two Lakh Seventy Two Thousand Only"
};