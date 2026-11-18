/**
 * Tanzanian National Identification Number (NIN) Validation and Auto-Formatting Utilities
 * 
 * Official Format: YYYYMMDD-XXXXX-XXXXX-XX (20 digits total, 23 characters with dashes)
 * - Group 1: 8 digits (YYYYMMDD) - Date of birth:
 *     - YYYY: Birth year (usually 1900 - current year, e.g. 1920-2025)
 *     - MM: Month (01-12)
 *     - DD: Day (01-31)
 * - Group 2: 5 digits (Zone / Region / District code)
 * - Group 3: 5 digits (Individual sequential serial)
 * - Group 4: 2 digits (Check digits / checksum)
 */

export interface NinValidationResult {
  isNinPattern: boolean;          // Does it look like a NIN in progress or completed?
  isValidCompleteNin: boolean;    // Is it a complete, fully valid 20-digit NIN?
  rawDigits: string;              // Only the numeric digits extracted (max 20)
  formattedNin: string;           // Standardized formatted string with hyphens
  parsedDob?: {
    year: number;
    month: number;
    day: number;
    isValidDate: boolean;
    dateString: string;
  };
  error?: string;
  progressPercent: number;        // Digits entered / 20 * 100
}

/**
 * Strips all non-digit characters from string, limiting to maximum 20 digits for a NIN.
 */
export function extractNinDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, 20);
}

/**
 * Automatically formats digits into the Tanzanian NIN pattern:
 * YYYYMMDD-XXXXX-XXXXX-XX
 */
export function formatTanzanianNin(input: string): string {
  const digits = extractNinDigits(input);
  if (!digits) return '';

  const part1 = digits.slice(0, 8);
  const part2 = digits.slice(8, 13);
  const part3 = digits.slice(13, 18);
  const part4 = digits.slice(18, 20);

  const parts = [part1, part2, part3, part4].filter(p => p.length > 0);
  return parts.join('-');
}

/**
 * Validates whether YYYYMMDD forms a plausible Gregorian calendar date.
 */
function validateDob(dateDigits: string): { isValidDate: boolean; year: number; month: number; day: number; dateString: string } | undefined {
  if (dateDigits.length < 8) return undefined;

  const year = parseInt(dateDigits.slice(0, 4), 10);
  const month = parseInt(dateDigits.slice(4, 6), 10);
  const day = parseInt(dateDigits.slice(6, 8), 10);

  const currentYear = new Date().getFullYear();
  if (year < 1910 || year > currentYear) {
    return { isValidDate: false, year, month, day, dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  }

  if (month < 1 || month > 12) {
    return { isValidDate: false, year, month, day, dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValidDate: false, year, month, day, dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  }

  return {
    isValidDate: true,
    year,
    month,
    day,
    dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
}

/**
 * Comprehensive client-side validation logic for Tanzanian NIN strings.
 */
export function validateTanzanianNin(input: string): NinValidationResult {
  const trimmed = input.trim();
  const digits = extractNinDigits(trimmed);
  const formatted = formatTanzanianNin(digits);
  const progressPercent = Math.min(100, Math.round((digits.length / 20) * 100));

  // Determine if input starts with a year pattern (19XX or 20XX) and looks like a NIN
  const startsWithYear = /^(19|20)\d{0,6}/.test(digits);
  // Also check if input includes hyphens in correct NIN positions
  const hasNinHyphens = /^\d{8}-\d{0,5}/.test(trimmed);

  const isNinPattern = (startsWithYear && digits.length >= 4) || hasNinHyphens || (digits.length >= 10 && !trimmed.startsWith('06') && !trimmed.startsWith('07') && !trimmed.startsWith('+255'));

  let parsedDob = undefined;
  if (digits.length >= 8) {
    parsedDob = validateDob(digits.slice(0, 8));
  }

  let error: string | undefined = undefined;

  if (digits.length >= 4) {
    const year = parseInt(digits.slice(0, 4), 10);
    const curYear = new Date().getFullYear();
    if (year < 1910 || year > curYear) {
      error = `Mwaka wa kuzaliwa usio sahihi: ${year}`;
    }
  }

  if (digits.length >= 6) {
    const month = parseInt(digits.slice(4, 6), 10);
    if (month < 1 || month > 12) {
      error = `Mwezi wa kuzaliwa usio sahihi (01-12): ${month}`;
    }
  }

  if (digits.length >= 8 && parsedDob && !parsedDob.isValidDate) {
    error = `Tarehe ya kuzaliwa haipo kwenye kalenda`;
  }

  const isFullLength = digits.length === 20;
  const isStrictFormat = /^\d{8}-\d{5}-\d{5}-\d{2}$/.test(formatted);
  const isValidCompleteNin = isFullLength && isStrictFormat && (!parsedDob || parsedDob.isValidDate);

  return {
    isNinPattern,
    isValidCompleteNin,
    rawDigits: digits,
    formattedNin: formatted,
    parsedDob,
    error,
    progressPercent
  };
}

/**
 * Checks if input is likely a Tanzanian phone number rather than a NIN
 */
export function isLikelyPhoneNumber(input: string): boolean {
  const clean = input.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+255') || clean.startsWith('255')) return true;
  if (clean.startsWith('07') || clean.startsWith('06')) return true;
  return false;
}
