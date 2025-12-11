/**
 * Utility to convert numbers to words (Indian numbering system)
 * Supports numbers up to 99,99,99,999 (9 crores, 99 lakhs, 99 thousand, 999)
 */

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertTwoDigits(num: number): string {
  if (num === 0) return '';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
}

function convertThreeDigits(num: number): string {
  if (num === 0) return '';
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  let result = '';
  if (hundred > 0) {
    result = ones[hundred] + ' Hundred';
  }
  
  if (remainder > 0) {
    result += (result ? ' ' : '') + convertTwoDigits(remainder);
  }
  
  return result;
}

/**
 * Convert number to words in Indian numbering system
 * @param amount - The number to convert (can be string or number)
 * @returns String representation in words
 */
export function numberToWords(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num) || num < 0) {
    return '';
  }
  
  if (num === 0) {
    return 'Zero Rupees Only';
  }
  
  // Round to 2 decimal places
  const roundedNum = Math.round(num * 100) / 100;
  const rupees = Math.floor(roundedNum);
  const paise = Math.round((roundedNum - rupees) * 100);
  
  let result = '';
  
  // Handle crores (10,000,000)
  const crores = Math.floor(rupees / 10000000);
  if (crores > 0) {
    result += convertTwoDigits(crores) + ' Crore ';
  }
  
  // Handle lakhs (100,000)
  const lakhs = Math.floor((rupees % 10000000) / 100000);
  if (lakhs > 0) {
    result += convertTwoDigits(lakhs) + ' Lakh ';
  }
  
  // Handle thousands (1,000)
  const thousands = Math.floor((rupees % 100000) / 1000);
  if (thousands > 0) {
    result += convertTwoDigits(thousands) + ' Thousand ';
  }
  
  // Handle hundreds, tens, and ones
  const remainder = rupees % 1000;
  if (remainder > 0) {
    result += convertThreeDigits(remainder) + ' ';
  }
  
  result = result.trim();
  
  // Add "Rupees"
  if (result) {
    result += ' Rupees';
  }
  
  // Add paise if present
  if (paise > 0) {
    result += ' and ' + convertTwoDigits(paise) + ' Paise';
  }
  
  result += ' Only';
  
  return result;
}
