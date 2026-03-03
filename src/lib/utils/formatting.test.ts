/**
 * Tests unitaires pour les utilitaires de formatage
 */

import {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeDate,
  formatPercentage,
  formatFileSize,
} from './formatting';

describe('Formatting Utilities', () => {
  describe('formatDate', () => {
    it('should format date in French locale', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'fr');
      expect(result).toBe('15/01/2024');
    });

    it('should format date in English locale', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'en');
      // English locale uses M/D/YYYY format
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/2024/);
    });

    it('should format date with custom options', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'fr', { dateStyle: 'long' });
      expect(result).toContain('janvier');
      expect(result).toContain('2024');
    });

    it('should handle ISO string dates', () => {
      const result = formatDate('2024-01-15', 'fr');
      // ISO dates may be interpreted in UTC, so check for day 14 or 15
      expect(result).toMatch(/1[45]\/01\/2024/);
    });

    it('should handle timestamp dates', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = formatDate(timestamp, 'fr');
      // Timestamps may be interpreted in UTC, so check for day 14 or 15
      expect(result).toMatch(/1[45]\/01\/2024/);
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date', 'fr');
      expect(result).toBe('invalid-date');
    });
  });

  describe('formatNumber', () => {
    it('should format number in French locale', () => {
      const result = formatNumber(1234.56, 'fr');
      // French uses non-breaking space (U+00A0) or narrow no-break space (U+202F)
      expect(result).toMatch(/1[\s\u00A0\u202F]234,56/);
    });

    it('should format number in English locale', () => {
      const result = formatNumber(1234.56, 'en');
      expect(result).toBe('1,234.56');
    });

    it('should format percentage', () => {
      const result = formatNumber(0.1234, 'fr', {
        style: 'percent',
        minimumFractionDigits: 2,
      });
      expect(result).toContain('12');
      expect(result).toContain('34');
    });

    it('should handle invalid numbers gracefully', () => {
      const result = formatNumber(NaN, 'fr');
      expect(result).toBe('NaN');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in French locale with EUR', () => {
      const result = formatCurrency(1234.56, 'fr');
      // Check for the number parts and euro symbol
      expect(result).toMatch(/1[\s\u00A0\u202F]234/);
      expect(result).toContain('56');
      expect(result).toContain('€');
    });

    it('should format currency in English locale with USD', () => {
      const result = formatCurrency(1234.56, 'en');
      expect(result).toContain('1,234');
      expect(result).toContain('56');
      expect(result).toContain('$');
    });

    it('should format currency with custom currency code', () => {
      const result = formatCurrency(1234.56, 'fr', 'USD');
      expect(result).toMatch(/1[\s\u00A0\u202F]234/);
      expect(result).toContain('56');
    });

    it('should handle zero decimals option', () => {
      const result = formatCurrency(1234.56, 'fr', 'EUR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      expect(result).toMatch(/1[\s\u00A0\u202F]235/);
      expect(result).not.toContain(',');
    });

    it('should handle invalid amounts gracefully', () => {
      const result = formatCurrency(NaN, 'fr');
      expect(result).toBe('NaN');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format past dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = formatRelativeDate(yesterday, 'fr');
      // Should contain some indication of past time
      expect(result.length).toBeGreaterThan(0);
      // Could be "hier", "il y a 1 jour", or similar
      expect(result).toBeTruthy();
    });

    it('should format future dates', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = formatRelativeDate(tomorrow, 'fr');
      // Should contain some indication of future time
      expect(result.length).toBeGreaterThan(0);
      // Could be "demain", "dans 1 jour", or similar
      expect(result).toBeTruthy();
    });

    it('should format recent dates in hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeDate(twoHoursAgo, 'fr');
      // Should return a valid relative time string
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatRelativeDate('invalid-date', 'fr');
      expect(result).toBe('invalid-date');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage in French locale', () => {
      const result = formatPercentage(0.1234, 'fr');
      expect(result).toContain('12');
      expect(result).toContain('%');
    });

    it('should format percentage in English locale', () => {
      const result = formatPercentage(0.1234, 'en');
      expect(result).toContain('12');
      expect(result).toContain('%');
    });

    it('should format percentage with decimals', () => {
      const result = formatPercentage(0.1234, 'fr', 2);
      expect(result).toContain('12');
      expect(result).toContain('34');
    });

    it('should handle zero', () => {
      const result = formatPercentage(0, 'fr');
      expect(result).toContain('0');
      expect(result).toContain('%');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      const result = formatFileSize(0, 'fr');
      expect(result).toBe('0 B');
    });

    it('should format kilobytes in French', () => {
      const result = formatFileSize(1024, 'fr');
      expect(result).toContain('1');
      expect(result).toContain('Ko');
    });

    it('should format kilobytes in English', () => {
      const result = formatFileSize(1024, 'en');
      expect(result).toContain('1');
      expect(result).toContain('KB');
    });

    it('should format megabytes', () => {
      const result = formatFileSize(1048576, 'fr');
      expect(result).toContain('1');
      expect(result).toContain('Mo');
    });

    it('should format gigabytes', () => {
      const result = formatFileSize(1073741824, 'fr');
      expect(result).toContain('1');
      expect(result).toContain('Go');
    });

    it('should respect decimal places', () => {
      const result = formatFileSize(1536, 'fr', 1);
      expect(result).toContain('1,5');
      expect(result).toContain('Ko');
    });
  });
});
