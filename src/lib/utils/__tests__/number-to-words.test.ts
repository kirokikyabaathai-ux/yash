/**
 * Tests for number-to-words utility
 */

import { numberToWords } from '../number-to-words';

describe('numberToWords', () => {
  test('converts basic amounts correctly', () => {
    expect(numberToWords(0)).toBe('Zero Rupees Only');
    expect(numberToWords(1)).toBe('One Rupees Only');
    expect(numberToWords(10)).toBe('Ten Rupees Only');
    expect(numberToWords(100)).toBe('One Hundred Rupees Only');
  });

  test('converts thousands correctly', () => {
    expect(numberToWords(1000)).toBe('One Thousand Rupees Only');
    expect(numberToWords(5000)).toBe('Five Thousand Rupees Only');
    expect(numberToWords(78000)).toBe('Seventy Eight Thousand Rupees Only');
  });

  test('converts lakhs correctly', () => {
    expect(numberToWords(100000)).toBe('One Lakh Rupees Only');
    expect(numberToWords(272000)).toBe('Two Lakh Seventy Two Thousand Rupees Only');
    expect(numberToWords(350000)).toBe('Three Lakh Fifty Thousand Rupees Only');
  });

  test('converts crores correctly', () => {
    expect(numberToWords(10000000)).toBe('One Crore Rupees Only');
    expect(numberToWords(50000000)).toBe('Five Crore Rupees Only');
  });

  test('handles decimal amounts with paise', () => {
    expect(numberToWords(100.50)).toBe('One Hundred Rupees and Fifty Paise Only');
    expect(numberToWords(1000.25)).toBe('One Thousand Rupees and Twenty Five Paise Only');
  });

  test('handles string input', () => {
    expect(numberToWords('272000')).toBe('Two Lakh Seventy Two Thousand Rupees Only');
    expect(numberToWords('350000')).toBe('Three Lakh Fifty Thousand Rupees Only');
  });

  test('handles invalid input', () => {
    expect(numberToWords('invalid')).toBe('');
    expect(numberToWords(-100)).toBe('');
  });
});
