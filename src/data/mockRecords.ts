import { NidaRecord, RegisteredSim } from '../types';

export const INITIAL_MOCK_RECORDS: NidaRecord[] = [
  {
    id: 'nida-0623033377',
    nin: '19990102455240000122',
    fullName: 'PASIKARI JACKOBO PASIKARI',
    firstName: 'PASIKARI',
    middleName: 'JACKOBO',
    lastName: 'PASIKARI',
    gender: 'MALE',
    dateOfBirth: '1999-01-02',
    age: 27,
    primaryPhone: '0623033377',
    registeredSims: [
      {
        msisdn: '0623033377',
        carrier: 'Halotel',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2021-03-15',
        simSerial: '892550623033377019',
        isPrimary: true,
      }
    ],
    placeOfBirth: {
      region: 'KIGOMA',
      district: 'KASULU',
      ward: 'KASULU MJINI',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: 'Biometrics confirmed via National Registry TCRA SIM link.',
    issueDate: '2020-02-14',
    expiryDate: '2030-02-14',
    documentNumber: 'TZ-NID-45524000',
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: 'SHA256:45524000122A...',
    residence: {
      region: 'DAR ES SALAAM',
      district: 'ILALA',
      ward: 'BUGURUNI',
      street: 'MALINDI ST. 12',
    },
    avatarPlaceholderColor: 'from-blue-600 to-indigo-900',
  },
  {
    id: 'nida-001',
    nin: '19900315-11103-00001-21',
    fullName: 'JUMA HAMISI BAKARI',
    firstName: 'JUMA',
    middleName: 'HAMISI',
    lastName: 'BAKARI',
    gender: 'MALE',
    dateOfBirth: '1990-03-15',
    age: 36,
    primaryPhone: '0754112233',
    registeredSims: [
      {
        msisdn: '0754112233',
        carrier: 'Vodacom',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2020-04-12',
        simSerial: '892550109923847192',
        isPrimary: true,
      },
      {
        msisdn: '0713445566',
        carrier: 'Tigo',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2021-08-20',
        simSerial: '892550204918239014',
        isPrimary: false,
      }
    ],
    placeOfBirth: {
      region: 'DAR ES SALAAM',
      district: 'ILALA',
      ward: 'KARIARKOO',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: 'Biometrics confirmed via National Registry Server 04 & TCRA SIM link.',
    issueDate: '2019-06-12',
    expiryDate: '2029-06-12',
    documentNumber: 'TZ-NID-88421098',
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: 'SHA256:7B9A2F41D09E...',
    residence: {
      region: 'DAR ES SALAAM',
      district: 'KINONDONI',
      ward: 'MAGOMENI',
      street: 'MOROGORO RD NO. 44',
    },
    avatarPlaceholderColor: 'from-amber-600 to-amber-900',
  },
  {
    id: 'nida-002',
    nin: '19850720-31201-00045-18',
    fullName: 'AMINA FATUMA SAIDI',
    firstName: 'AMINA',
    middleName: 'FATUMA',
    lastName: 'SAIDI',
    gender: 'FEMALE',
    dateOfBirth: '1985-07-20',
    age: 41,
    primaryPhone: '0685994422',
    registeredSims: [
      {
        msisdn: '0685994422',
        carrier: 'Airtel',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2019-11-05',
        simSerial: '892550302847192837',
        isPrimary: true,
      }
    ],
    placeOfBirth: {
      region: 'ARUSHA',
      district: 'ARUSHA CITY',
      ward: 'SEKEI',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: 'Active registry status. Digital credential issued.',
    issueDate: '2021-02-18',
    expiryDate: '2031-02-18',
    documentNumber: 'TZ-NID-41920853',
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: 'SHA256:A14C9E820F12...',
    residence: {
      region: 'ARUSHA',
      district: 'ARUSHA CITY',
      ward: 'THEMI',
      street: 'OLD MOSHI RD PLOT 12',
    },
    avatarPlaceholderColor: 'from-emerald-700 to-teal-950',
  },
  {
    id: 'nida-003',
    nin: '19941208-14205-00129-22',
    fullName: 'ELIYA AMOS MWAKYUSA',
    firstName: 'ELIYA',
    middleName: 'AMOS',
    lastName: 'MWAKYUSA',
    gender: 'MALE',
    dateOfBirth: '1994-12-08',
    age: 31,
    primaryPhone: '0784615052', // Matching user developer telephone
    registeredSims: [
      {
        msisdn: '0784615052',
        carrier: 'Airtel',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2018-03-14',
        simSerial: '892550301128473892',
        isPrimary: true,
      },
      {
        msisdn: '0767112299',
        carrier: 'Vodacom',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2020-07-22',
        simSerial: '892550103348192847',
        isPrimary: false,
      }
    ],
    placeOfBirth: {
      region: 'MBEYA',
      district: 'MBEYA CITY',
      ward: 'SISIMBA',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: 'Primary citizen credential verified. Mobile SIM registration confirmed with TCRA.',
    issueDate: '2020-09-04',
    expiryDate: '2030-09-04',
    documentNumber: 'TZ-NID-99382104',
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: 'SHA256:E88219BA4401...',
    residence: {
      region: 'DAR ES SALAAM',
      district: 'UBUNGO',
      ward: 'SINZA',
      street: 'SAM NUJOMA WAY 10',
    },
    avatarPlaceholderColor: 'from-yellow-600 to-stone-900',
  },
  {
    id: 'nida-004',
    nin: '19790412-25103-00088-14',
    fullName: 'BARAKA JOHN MUSHI',
    firstName: 'BARAKA',
    middleName: 'JOHN',
    lastName: 'MUSHI',
    gender: 'MALE',
    dateOfBirth: '1979-04-12',
    age: 47,
    primaryPhone: '0742881190',
    registeredSims: [
      {
        msisdn: '0742881190',
        carrier: 'Vodacom',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2019-10-10',
        simSerial: '892550109923849123',
        isPrimary: true,
      }
    ],
    placeOfBirth: {
      region: 'KILIMANJARO',
      district: 'MOSHI URBAN',
      ward: 'KIBORILONI',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: 'Standard renewal completed. Document certified.',
    issueDate: '2018-11-20',
    expiryDate: '2028-11-20',
    documentNumber: 'TZ-NID-63520119',
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: 'SHA256:C391AA882E09...',
    residence: {
      region: 'KILIMANJARO',
      district: 'MOSHI URBAN',
      ward: 'PASUA',
      street: 'KILIMANJARO AVE 8',
    },
    avatarPlaceholderColor: 'from-amber-700 to-neutral-900',
  },
  {
    id: 'nida-005',
    nin: '19980630-18402-00215-20',
    fullName: 'NEEMA REHEMA MWANGI',
    firstName: 'NEEMA',
    middleName: 'REHEMA',
    lastName: 'MWANGI',
    gender: 'FEMALE',
    dateOfBirth: '1998-06-30',
    age: 28,
    primaryPhone: '0622334455',
    registeredSims: [
      {
        msisdn: '0622334455',
        carrier: 'Halotel',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2022-01-18',
        simSerial: '892550401827491029',
        isPrimary: true,
      },
      {
        msisdn: '0678990011',
        carrier: 'Tigo',
        biometricStatus: 'BIOMETRIC_VERIFIED',
        registrationDate: '2023-05-11',
        simSerial: '892550209938172635',
        isPrimary: false,
      }
    ],
    placeOfBirth: {
      region: 'MWANZA',
      district: 'NYAMAGANA',
      ward: 'MKUYUNI',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: 'Biometrics recorded. National identity token active.',
    issueDate: '2022-04-15',
    expiryDate: '2032-04-15',
    documentNumber: 'TZ-NID-77209144',
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: 'SHA256:91FF028AC3B2...',
    residence: {
      region: 'MWANZA',
      district: 'ILEMELA',
      ward: 'BUSWELU',
      street: 'AIRPORT RD BLK 3',
    },
    avatarPlaceholderColor: 'from-emerald-800 to-black',
  },
  {
    id: 'nida-006',
    nin: '19921014-41108-00560-16',
    fullName: 'GODFREY PETER NDUNGURU',
    firstName: 'GODFREY',
    middleName: 'PETER',
    lastName: 'NDUNGURU',
    gender: 'MALE',
    dateOfBirth: '1992-10-14',
    age: 33,
    primaryPhone: '0717654321',
    registeredSims: [
      {
        msisdn: '0717654321',
        carrier: 'Tigo',
        biometricStatus: 'PENDING_REGISTRATION',
        registrationDate: '2023-11-02',
        simSerial: '892550207748192834',
        isPrimary: true,
      }
    ],
    placeOfBirth: {
      region: 'RUVUMA',
      district: 'SONGEA URBAN',
      ward: 'MAJENGO',
    },
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'PENDING_UPDATE',
    statusNotes: 'Address update pending physical biometric verification.',
    issueDate: '2019-01-10',
    expiryDate: '2029-01-10',
    documentNumber: 'TZ-NID-55092183',
    fingerprintEnrolled: true,
    facialRecognitionMatched: false,
    securityChecksum: 'SHA256:44E10B3920FF...',
    residence: {
      region: 'DAR ES SALAAM',
      district: 'TEMEKE',
      ward: 'CHANG\'OMBE',
      street: 'MANDELA RD PLOT 50',
    },
    avatarPlaceholderColor: 'from-yellow-700 to-amber-950',
  }
];

// Helper to normalize query string (stripping hyphens, spaces, etc.)
export function normalizeQuery(query: string): string {
  return query.trim().replace(/[-–\s]/g, '').toUpperCase();
}

// Helper to clean Tanzanian phone number format
// Supports e.g.: +255 784 615 052, 255784615052, 0784615052, 784615052
export function normalizePhoneNumber(raw: string): string {
  let cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+255')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('255') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(3);
  } else if ((cleaned.startsWith('7') || cleaned.startsWith('6')) && cleaned.length === 9) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

// Check if a string is a phone number
export function isPhoneNumberQuery(input: string): boolean {
  const norm = normalizePhoneNumber(input);
  // Tanzania standard numbers: 10 digits starting with 06 or 07
  return /^0[67]\d{8}$/.test(norm);
}

// Detect mobile network operator carrier from phone prefix
export function detectCarrier(phone: string): 'Airtel' | 'Vodacom' | 'Tigo' | 'Halotel' | 'TTCL' {
  const norm = normalizePhoneNumber(phone);
  const prefix = norm.substring(0, 3);
  if (['074', '075', '076'].includes(prefix)) return 'Vodacom';
  if (['068', '069', '078', '079'].includes(prefix)) return 'Airtel';
  if (['065', '067', '071', '077'].includes(prefix)) return 'Tigo';
  if (['062', '061'].includes(prefix)) return 'Halotel';
  if (['073'].includes(prefix)) return 'TTCL';
  return 'Airtel';
}

// Generate deterministic number from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generates an authentic deterministic NIDA record for any queried text if not in mock set
export function generateDynamicRecord(query: string): NidaRecord {
  const clean = query.trim();
  const seed = hashString(clean);

  const isPhone = isPhoneNumberQuery(clean);
  const isNumeric = /^\d+$/.test(clean.replace(/[-–\s+]/g, ''));

  let fullName = '';
  let nin = '';
  let gender: 'MALE' | 'FEMALE' = seed % 2 === 0 ? 'MALE' : 'FEMALE';
  let birthYear = 1975 + (seed % 28); // 1975 - 2003
  let birthMonth = String(1 + (seed % 12)).padStart(2, '0');
  let birthDay = String(1 + (seed % 28)).padStart(2, '0');

  let phone = '';
  if (isPhone) {
    phone = normalizePhoneNumber(clean);
  } else {
    // Generate authentic phone number based on seed
    const prefixes = ['0754', '0784', '0713', '0685', '0767', '0622', '0655'];
    const pfx = prefixes[seed % prefixes.length];
    const rest = String(100000 + (seed % 899999));
    phone = `${pfx}${rest}`;
  }

  const detectedCarrierName = detectCarrier(phone);

  if (isPhone) {
    // Citizen generated from phone lookup
    const maleNames = ['HASSAN', 'EMMANUEL', 'RASHID', 'KELVIN', 'KASSIM', 'DENIS', 'MWINYI', 'INNOCENT', 'SELEMANI', 'JOSEPH'];
    const femaleNames = ['FATUMA', 'ZAINAB', 'GLORY', 'HALIMA', 'MARIAM', 'SUBIRA', 'ESTER', 'GRACE', 'DEVOTHA', 'MWANAIDI'];
    const surnames = ['MKAPA', 'KIKWETE', 'MGANGA', 'MSANGI', 'TARIMO', 'NYERERE', 'LUHANGA', 'KIMARO', 'SHABANI', 'MWITA', 'MASANJA'];

    const chosenFirst = gender === 'MALE' ? maleNames[seed % maleNames.length] : femaleNames[seed % femaleNames.length];
    const chosenMiddle = surnames[(seed * 3) % surnames.length];
    const chosenLast = surnames[(seed * 5) % surnames.length];
    fullName = `${chosenFirst} ${chosenMiddle} ${chosenLast}`;

    const part1 = `${birthYear}${birthMonth}${birthDay}`;
    const part2 = String(12000 + (seed % 39000));
    const part3 = String(10000 + ((seed * 7) % 89000));
    const part4 = String(11 + (seed % 79));
    nin = `${part1}-${part2}-${part3}-${part4}`;
  } else if (isNumeric && !isPhone) {
    // 20-digit or partial NIN query
    const rawDigits = clean.replace(/[-–\s]/g, '');
    if (rawDigits.length >= 8) {
      const yearPart = parseInt(rawDigits.substring(0, 4), 10);
      if (yearPart >= 1930 && yearPart <= 2015) {
        birthYear = yearPart;
        birthMonth = rawDigits.substring(4, 6) || birthMonth;
        birthDay = rawDigits.substring(6, 8) || birthDay;
      }
    }
    
    // Construct proper 20-digit NIDA format: YYYYMMDD-XXXXX-XXXXX-XX
    const part1 = `${birthYear}${birthMonth}${birthDay}`;
    const part2 = String(10000 + (seed % 89999));
    const part3 = String(10000 + ((seed * 7) % 89999));
    const part4 = String(10 + (seed % 89));
    nin = `${part1}-${part2}-${part3}-${part4}`;

    const maleNames = ['HASSAN', 'EMMANUEL', 'RASHID', 'KELVIN', 'KASSIM', 'DENIS', 'MWINYI', 'INNOCENT'];
    const femaleNames = ['FATUMA', 'ZAINAB', 'GLORY', 'HALIMA', 'MARIAM', 'SUBIRA', 'ESTER', 'GRACE'];
    const surnames = ['MKAPA', 'KIKWETE', 'MGANGA', 'MSANGI', 'TARIMO', 'NYERERE', 'LUHANGA', 'KIMARO', 'SHABANI'];

    const chosenFirst = gender === 'MALE' ? maleNames[seed % maleNames.length] : femaleNames[seed % femaleNames.length];
    const chosenMiddle = surnames[(seed * 3) % surnames.length];
    const chosenLast = surnames[(seed * 5) % surnames.length];
    fullName = `${chosenFirst} ${chosenMiddle} ${chosenLast}`;
  } else {
    // User typed a name!
    const parts = clean.toUpperCase().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      fullName = `${parts[0]} RAJABU MWAMBA`;
    } else if (parts.length === 2) {
      fullName = `${parts[0]} ${parts[1]}`;
    } else {
      fullName = parts.join(' ');
    }

    const femaleKeywords = ['AMINA', 'FATUMA', 'MARY', 'MARIAM', 'NEEMA', 'GRACE', 'ZAINAB', 'HALIMA', 'ROSE', 'SARAH', 'AISHA', 'REHEMA'];
    const firstName = fullName.split(' ')[0];
    if (femaleKeywords.includes(firstName)) {
      gender = 'FEMALE';
    }

    const part1 = `${birthYear}${birthMonth}${birthDay}`;
    const part2 = String(11000 + (seed % 39000));
    const part3 = String(10000 + ((seed * 3) % 89000));
    const part4 = String(11 + (seed % 79));
    nin = `${part1}-${part2}-${part3}-${part4}`;
  }

  const regions = [
    { region: 'DAR ES SALAAM', district: 'ILALA', ward: 'UPANGA' },
    { region: 'DAR ES SALAAM', district: 'KINONDONI', ward: 'KIJITONYAMA' },
    { region: 'ARUSHA', district: 'ARUSHA CC', ward: 'SEKEI' },
    { region: 'MWANZA', district: 'NYAMAGANA', ward: 'PANGA' },
    { region: 'DODOMA', district: 'DODOMA MC', ward: 'TAMBUKARELI' },
    { region: 'MBEYA', district: 'MBEYA CC', ward: 'RUANDA' },
    { region: 'MOROGORO', district: 'MOROGORO MC', ward: 'KINGOLWIRA' },
    { region: 'TANGA', district: 'TANGA CC', ward: 'NGAMIANI' },
    { region: 'KILIMANJARO', district: 'MOSHI MC', ward: 'PASUA' },
  ];
  const loc = regions[seed % regions.length];

  const nameParts = fullName.split(' ');
  const fName = nameParts[0] || 'CITIZEN';
  const mName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : (nameParts[1] || '');
  const lName = nameParts[nameParts.length - 1] || 'TANZANIA';

  const docNum = `TZ-NID-${10000000 + (seed % 89999999)}`;
  const currentYear = 2026;
  const age = currentYear - birthYear;

  const hexHash = (seed * 999983).toString(16).toUpperCase().padStart(8, '0');

  const registeredSims: RegisteredSim[] = [
    {
      msisdn: phone,
      carrier: detectedCarrierName,
      biometricStatus: 'BIOMETRIC_VERIFIED',
      registrationDate: `${birthYear + 20}-08-15`,
      simSerial: `892550${(seed % 900000000000) + 100000000000}`,
      isPrimary: true,
    }
  ];

  return {
    id: `dyn-${seed}`,
    nin,
    fullName,
    firstName: fName,
    middleName: mName || undefined,
    lastName: lName,
    gender,
    dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
    age,
    primaryPhone: phone,
    registeredSims,
    placeOfBirth: loc,
    nationality: 'TANZANIAN',
    citizenshipType: 'CITIZEN BY BIRTH',
    verificationStatus: 'VERIFIED',
    statusNotes: isPhone 
      ? `NIDA Biometric matched via TCRA SIM Card (${detectedCarrierName} - ${phone}).`
      : 'Cryptographic biometric signature verified with NIDA Central Server.',
    issueDate: `${birthYear + 22}-05-14`,
    expiryDate: `${birthYear + 32}-05-14`,
    documentNumber: docNum,
    fingerprintEnrolled: true,
    facialRecognitionMatched: true,
    securityChecksum: `SHA256:${hexHash}A9F...`,
    residence: {
      region: loc.region,
      district: loc.district,
      ward: loc.ward,
      street: `STREET ZONE ${(seed % 14) + 1}`,
    },
    avatarPlaceholderColor: gender === 'MALE' ? 'from-amber-600 to-amber-950' : 'from-emerald-700 to-teal-950',
  };
}

export function lookupNidaRecord(query: string): { 
  record: NidaRecord | null; 
  isGenerated: boolean;
  matchedBy: 'phone' | 'nin' | 'name' | null;
} {
  if (!query || !query.trim()) {
    return { record: null, isGenerated: false, matchedBy: null };
  }

  const cleanQuery = query.trim();
  const normalized = normalizeQuery(cleanQuery);
  const normalizedPhone = normalizePhoneNumber(cleanQuery);

  // 1. Direct match on phone number (Primary or Registered SIMs)
  if (normalizedPhone.length >= 9) {
    const matchByPhone = INITIAL_MOCK_RECORDS.find((r) => {
      if (normalizePhoneNumber(r.primaryPhone) === normalizedPhone) return true;
      return r.registeredSims.some((sim) => normalizePhoneNumber(sim.msisdn) === normalizedPhone);
    });

    if (matchByPhone) {
      return { record: matchByPhone, isGenerated: false, matchedBy: 'phone' };
    }
  }

  // 2. Direct match on mock NIN
  const matchByNin = INITIAL_MOCK_RECORDS.find(
    (r) => normalizeQuery(r.nin) === normalized || normalizeQuery(r.nin).includes(normalized)
  );
  if (matchByNin) {
    return { record: matchByNin, isGenerated: false, matchedBy: 'nin' };
  }

  // 3. Direct match on name
  const matchByName = INITIAL_MOCK_RECORDS.find(
    (r) => r.fullName.toUpperCase().includes(cleanQuery.toUpperCase())
  );
  if (matchByName) {
    return { record: matchByName, isGenerated: false, matchedBy: 'name' };
  }

  // 4. Dynamic generation matching the query
  const generated = generateDynamicRecord(cleanQuery);
  const matchedType = isPhoneNumberQuery(cleanQuery) ? 'phone' : (/^\d+$/.test(normalized) ? 'nin' : 'name');
  return { record: generated, isGenerated: true, matchedBy: matchedType };
}

export const generateRealisticRecord = generateDynamicRecord;
