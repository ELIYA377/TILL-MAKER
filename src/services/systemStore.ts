import { SystemUser, NidaServiceRequest, DepositRecord, CreditRequest, ApiLogEntry, AuditLogEntry, UserActivityLog } from '../types';

const USERS_KEY = 'nidatz_users_v2';
const CURRENT_USER_KEY = 'currentUser';
const REQUESTS_KEY = 'nidatz_requests_v2';
const DEPOSITS_KEY = 'nidatz_deposits_v2';
const CREDIT_REQUESTS_KEY = 'nidatz_credit_requests_v2';
const API_LOGS_KEY = 'sinsoft_api_logs_v1';
const AUDIT_LOGS_KEY = 'nidatz_audit_logs_v1';

export const REQUEST_COST_TSH = 40.00;

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-9901',
    action: 'LOGIN_SUCCESS',
    actorPhone: '0784615052',
    actorRole: 'admin',
    details: 'Super Admin Eliya Amos Mwakyusa ameingia kwenye Mfumo.',
    timestamp: Date.now() - 15 * 60000,
  },
  {
    id: 'AUD-9902',
    action: 'CREDIT_REQUEST_APPROVED',
    actorPhone: '0784615052',
    actorRole: 'admin',
    targetPhone: '0713987654',
    targetName: 'Baraka Joseph Mushi',
    details: 'Ombi la salio TSh 5,000 limeidhinishwa kwa Baraka Joseph Mushi.',
    metadata: { amount: 5000, transactionRef: 'AM440188P' },
    timestamp: Date.now() - 1.8 * 3600000,
  },
  {
    id: 'AUD-9903',
    action: 'CREDIT_ADDED',
    actorPhone: '0784615052',
    actorRole: 'admin',
    targetPhone: '0754112233',
    targetName: 'Juma Hamisi Bakari',
    details: 'Admin amemwongezea TSh 2,000 moja kwa moja mtumiaji 0754112233.',
    metadata: { amount: 2000 },
    timestamp: Date.now() - 3 * 3600000,
  },
  {
    id: 'AUD-9904',
    action: 'USER_CREATED',
    actorPhone: '0784615052',
    actorRole: 'admin',
    targetPhone: '0761234567',
    targetName: 'Innocent Patrick Mlay',
    details: 'Akaunti mpya ya mtumiaji 0761234567 imesajiliwa na Admin.',
    metadata: { initialCredit: 480, role: 'user' },
    timestamp: Date.now() - 5 * 3600000,
  },
  {
    id: 'AUD-9905',
    action: 'LOGIN_SUCCESS',
    actorPhone: '0754112233',
    actorRole: 'user',
    details: 'Mtumiaji Juma Hamisi Bakari (0754112233) ameingia kwenye mfumo.',
    timestamp: Date.now() - 7 * 3600000,
  },
];

const SEED_CREDIT_REQUESTS: CreditRequest[] = [
  {
    id: 'CR-1042',
    userPhone: '0754112233',
    userName: 'Juma Hamisi Bakari',
    amount: 2000,
    paymentMethod: 'M-Pesa',
    transactionRef: 'QC78KL92M',
    notes: 'Malipo ya salio la maombi ya NIDA kupitia Lipa Namba',
    status: 'Pending',
    timestamp: Date.now() - 25 * 60000,
  },
  {
    id: 'CR-1039',
    userPhone: '0655234567',
    userName: 'Amina Rashid Said',
    amount: 1000,
    paymentMethod: 'Tigo Pesa',
    transactionRef: 'TG991204X',
    notes: 'Tigo Pesa kurahisisha kazi za siku',
    status: 'Pending',
    timestamp: Date.now() - 55 * 60000,
  },
  {
    id: 'CR-1025',
    userPhone: '0713987654',
    userName: 'Baraka Joseph Mushi',
    amount: 5000,
    paymentMethod: 'Airtel Money',
    transactionRef: 'AM440188P',
    notes: 'Salio limekamilika jana',
    status: 'Approved',
    timestamp: Date.now() - 2 * 3600000,
    reviewedAt: Date.now() - 1.8 * 3600000,
    reviewedBy: '0784615052',
  },
];

// Default Seed Users (32 registered users to match nidatz.wuaze.com metrics)
const SEED_USERS: SystemUser[] = [
  {
    id: 'USR-0754112233',
    phone: '0754112233',
    email: 'juma@nidapass.go.tz',
    nin: '19900315-11103-00001-21',
    password: 'user123',
    role: 'user',
    credit: 480.00,
    fullName: 'Juma Hamisi Bakari',
    dateOfBirth: '1990-03-15',
    gender: 'MALE',
    nationality: 'TANZANIAN',
    residence: 'Ilala, Dar es Salaam',
    district: 'Ilala',
    verificationTier: 'Tier 3 (Citizen Verified)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19900315-A1',
    issueDate: '2020-04-12',
    expiryDate: '2030-04-12',
    avatarUrl: '/src/assets/images/avatar_citizen_verified_1790750468089.jpg',
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'USR-0784615052',
    phone: '0784615052',
    email: 'admin@nidapass.go.tz',
    nin: '19941208-14205-00129-22',
    password: 'Eliya@123',
    role: 'admin',
    credit: 85000.00,
    fullName: 'Eliya Amos Mwakyusa (Admin)',
    dateOfBirth: '1994-12-08',
    gender: 'MALE',
    nationality: 'TANZANIAN',
    residence: 'Kinondoni, Dar es Salaam',
    district: 'Kinondoni',
    verificationTier: 'Tier 4 (Superintendent)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19941208-AD',
    issueDate: '2019-10-01',
    expiryDate: '2029-10-01',
    avatarUrl: '/src/assets/images/avatar_citizen_verified_1790750468089.jpg',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'USR-0755461242',
    phone: '0755461242',
    email: 'feeder@nidapass.go.tz',
    nin: '19920714-33102-00045-18',
    password: 'Eliya@123',
    role: 'feeder',
    credit: 15000.00,
    fullName: 'Eliya Amos (Feeder Officer)',
    dateOfBirth: '1992-07-14',
    gender: 'MALE',
    nationality: 'TANZANIAN',
    residence: 'Dodoma City',
    district: 'Dodoma Urban',
    verificationTier: 'Tier 3 (Feeder Desk)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19920714-FD',
    issueDate: '2021-03-10',
    expiryDate: '2031-03-10',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'USR-0700000000',
    phone: '0700000000',
    email: 'head@nidapass.go.tz',
    nin: '19850101-11101-00001-19',
    password: 'admin123',
    role: 'admin',
    credit: 85000.00,
    fullName: 'System Administrator (NIDA Head)',
    dateOfBirth: '1985-01-01',
    gender: 'MALE',
    nationality: 'TANZANIAN',
    residence: 'Dodoma City',
    district: 'Dodoma Urban',
    verificationTier: 'Tier 4 (Executive)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19850101-EX',
    issueDate: '2018-01-01',
    expiryDate: '2028-01-01',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'USR-0600000000',
    phone: '0600000000',
    email: 'desk@nidapass.go.tz',
    nin: '19880520-22104-00018-20',
    password: 'feeder123',
    role: 'feeder',
    credit: 12000.00,
    fullName: 'Agent Desk Feeder (Dar es Salaam)',
    dateOfBirth: '1988-05-20',
    gender: 'FEMALE',
    nationality: 'TANZANIAN',
    residence: 'Temeke, Dar es Salaam',
    district: 'Temeke',
    verificationTier: 'Tier 3 (Desk Officer)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19880520-FE',
    issueDate: '2021-01-15',
    expiryDate: '2031-01-15',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'USR-0655234567',
    phone: '0655234567',
    email: 'amina@nidapass.go.tz',
    nin: '19950822-22204-00002-22',
    password: 'user123',
    role: 'user',
    credit: 160.00,
    fullName: 'Amina Rashid Said',
    dateOfBirth: '1995-08-22',
    gender: 'FEMALE',
    nationality: 'TANZANIAN',
    residence: 'Arusha City',
    district: 'Arusha Urban',
    verificationTier: 'Tier 3 (Citizen Verified)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19950822-B2',
    issueDate: '2021-05-18',
    expiryDate: '2031-05-18',
    createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'USR-0713987654',
    phone: '0713987654',
    email: 'baraka@nidapass.go.tz',
    nin: '19881104-33305-00003-23',
    password: 'user123',
    role: 'user',
    credit: 320.00,
    fullName: 'Baraka Joseph Mushi',
    dateOfBirth: '1988-11-04',
    gender: 'MALE',
    nationality: 'TANZANIAN',
    residence: 'Moshi Urban',
    district: 'Moshi',
    verificationTier: 'Tier 3 (Citizen Verified)',
    passStatus: 'ACTIVE',
    documentNumber: 'TZ-NID-19881104-C3',
    issueDate: '2020-09-12',
    expiryDate: '2030-09-12',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'USR-0768451230',
    phone: '0768451230',
    password: 'user123',
    role: 'user',
    credit: 120.00,
    fullName: 'Neema Charles Kitila',
    createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: 'USR-0621456987',
    phone: '0621456987',
    password: 'user123',
    role: 'user',
    credit: 400.00,
    fullName: 'Emmanuel Peter Tarimo',
    createdAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'USR-0692345678',
    phone: '0692345678',
    password: 'user123',
    role: 'user',
    credit: 80.00,
    fullName: 'Rehema Hassan Mrema',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'USR-0745678912',
    phone: '0745678912',
    password: 'user123',
    role: 'user',
    credit: 600.00,
    fullName: 'Godfrey Lucas Temba',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'USR-0789123456',
    phone: '0789123456',
    password: 'user123',
    role: 'user',
    credit: 0.00,
    fullName: 'Fatma Zuberi Ally',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'USR-0715345678',
    phone: '0715345678',
    password: 'user123',
    role: 'user',
    credit: 1200.00,
    fullName: 'Kassim Salum Mwinyi',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'USR-0684123456',
    phone: '0684123456',
    password: 'user123',
    role: 'user',
    credit: 200.00,
    fullName: 'Zainab Omary Selemani',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'USR-0762987123',
    phone: '0762987123',
    password: 'user123',
    role: 'user',
    credit: 360.00,
    fullName: 'Daudi Alex Msigwa',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'USR-0654321987',
    phone: '0654321987',
    password: 'user123',
    role: 'user',
    credit: 520.00,
    fullName: 'Grace Wilson Mbowe',
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'USR-0741236547',
    phone: '0741236547',
    password: 'user123',
    role: 'user',
    credit: 800.00,
    fullName: 'Hamisi Saidi Mgunda',
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'USR-0678123987',
    phone: '0678123987',
    password: 'user123',
    role: 'user',
    credit: 160.00,
    fullName: 'Asha Ramadhani Mkude',
    createdAt: Date.now() - 12 * 3600000,
  },
  {
    id: 'USR-0623456781',
    phone: '0623456781',
    password: 'user123',
    role: 'user',
    credit: 280.00,
    fullName: 'Kelvin Richard Massawe',
    createdAt: Date.now() - 10 * 3600000,
  },
  {
    id: 'USR-0785671234',
    phone: '0785671234',
    password: 'user123',
    role: 'user',
    credit: 440.00,
    fullName: 'Halima Athumani Khalfan',
    createdAt: Date.now() - 8 * 3600000,
  },
  {
    id: 'USR-0759876543',
    phone: '0759876543',
    password: 'user123',
    role: 'user',
    credit: 120.00,
    fullName: 'Yusuf Nassoro Mapunda',
    createdAt: Date.now() - 6 * 3600000,
  },
  {
    id: 'USR-0718765432',
    phone: '0718765432',
    password: 'user123',
    role: 'user',
    credit: 240.00,
    fullName: 'Joyce Michael Lyimo',
    createdAt: Date.now() - 5 * 3600000,
  },
  {
    id: 'USR-0659871234',
    phone: '0659871234',
    password: 'user123',
    role: 'user',
    credit: 320.00,
    fullName: 'Rashid Mohamed Kiwanga',
    createdAt: Date.now() - 4 * 3600000,
  },
  {
    id: 'USR-0687654321',
    phone: '0687654321',
    password: 'user123',
    role: 'user',
    credit: 40.00,
    fullName: 'Saida Selemani Chande',
    createdAt: Date.now() - 3 * 3600000,
  },
  {
    id: 'USR-0763456789',
    phone: '0763456789',
    password: 'user123',
    role: 'user',
    credit: 680.00,
    fullName: 'Frank Edward Minja',
    createdAt: Date.now() - 2 * 3600000,
  },
  {
    id: 'USR-0749876543',
    phone: '0749876543',
    password: 'user123',
    role: 'user',
    credit: 160.00,
    fullName: 'Hawa Shabani Mgaya',
    createdAt: Date.now() - 2 * 3600000,
  },
  {
    id: 'USR-0628765432',
    phone: '0628765432',
    password: 'user123',
    role: 'user',
    credit: 400.00,
    fullName: 'Salim Issa Juma',
    createdAt: Date.now() - 1 * 3600000,
  },
  {
    id: 'USR-0782345678',
    phone: '0782345678',
    password: 'user123',
    role: 'user',
    credit: 200.00,
    fullName: 'Jackline Peter Swai',
    createdAt: Date.now() - 50 * 60000,
  },
  {
    id: 'USR-0756789123',
    phone: '0756789123',
    password: 'user123',
    role: 'user',
    credit: 560.00,
    fullName: 'Mwajuma Kassim Kibwana',
    createdAt: Date.now() - 40 * 60000,
  },
  {
    id: 'USR-0714567890',
    phone: '0714567890',
    password: 'user123',
    role: 'user',
    credit: 120.00,
    fullName: 'Moses Daniel Ndosi',
    createdAt: Date.now() - 30 * 60000,
  },
  {
    id: 'USR-0653456789',
    phone: '0653456789',
    password: 'user123',
    role: 'user',
    credit: 320.00,
    fullName: 'Subira Said Mkungwa',
    createdAt: Date.now() - 20 * 60000,
  },
  {
    id: 'USR-0689876543',
    phone: '0689876543',
    password: 'user123',
    role: 'user',
    credit: 240.00,
    fullName: 'Tatu Ramadhani Mwambene',
    createdAt: Date.now() - 15 * 60000,
  },
  {
    id: 'USR-0761234567',
    phone: '0761234567',
    password: 'user123',
    role: 'user',
    credit: 480.00,
    fullName: 'Innocent Patrick Mlay',
    createdAt: Date.now() - 10 * 60000,
  }
];

// Seed Requests with pending and completed items
const SEED_REQUESTS: NidaServiceRequest[] = [
  {
    id: 'REQ-9821',
    userId: 'USR-0784615052',
    userPhone: '0784615052',
    targetPhone: '0784615052',
    applicantName: 'ELIYA AMOS MWAKYUSA',
    timestamp: Date.now() - 25 * 60000, // Today
    status: 'Completed',
    nidaNumber: '19941208-14205-00129-22',
    completedAt: Date.now() - 15 * 60000,
    adminNotes: 'NIDA imehakikiwa kulingana na usajili wa biometria wa Airtel.',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9820',
    userId: 'USR-0754112233',
    userPhone: '0754112233',
    targetPhone: '0754112233',
    applicantName: 'JUMA HAMISI BAKARI',
    timestamp: Date.now() - 50 * 60000, // Today
    status: 'Completed',
    nidaNumber: '19900315-11103-00001-21',
    completedAt: Date.now() - 35 * 60000,
    adminNotes: 'NIDA imehakikiwa kutoka kanzidata ya Vodacom/TCRA.',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9819',
    userId: 'USR-0784615052',
    userPhone: '0784615052',
    targetPhone: '0655234567',
    applicantName: 'AMINA RASHID SAID',
    timestamp: Date.now() - 8 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9818',
    userId: 'USR-0713987654',
    userPhone: '0713987654',
    targetPhone: '0713987654',
    applicantName: 'BARAKA JOSEPH MUSHI',
    timestamp: Date.now() - 12 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9817',
    userId: 'USR-0768451230',
    userPhone: '0768451230',
    targetPhone: '0768451230',
    applicantName: 'NEEMA CHARLES KITILA',
    timestamp: Date.now() - 18 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9816',
    userId: 'USR-0621456987',
    userPhone: '0621456987',
    targetPhone: '0621456987',
    applicantName: 'EMMANUEL PETER TARIMO',
    timestamp: Date.now() - 22 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9815',
    userId: 'USR-0692345678',
    userPhone: '0692345678',
    targetPhone: '0692345678',
    applicantName: 'REHEMA HASSAN MREMA',
    timestamp: Date.now() - 30 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9814',
    userId: 'USR-0745678912',
    userPhone: '0745678912',
    targetPhone: '0745678912',
    applicantName: 'GODFREY LUCAS TEMBA',
    timestamp: Date.now() - 45 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9813',
    userId: 'USR-0715345678',
    userPhone: '0715345678',
    targetPhone: '0715345678',
    applicantName: 'KASSIM SALUM MWINYI',
    timestamp: Date.now() - 60 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  {
    id: 'REQ-9812',
    userId: 'USR-0684123456',
    userPhone: '0684123456',
    targetPhone: '0684123456',
    applicantName: 'ZAINAB OMARY SELEMANI',
    timestamp: Date.now() - 75 * 60000,
    status: 'Pending',
    costTokens: 1,
    costTsh: 40.00,
  },
  // Additional pending requests to reflect incoming queue (e.g. 42 pending tasks)
  ...Array.from({ length: 32 }, (_, i) => ({
    id: `REQ-${9800 - i}`,
    userId: `USR-07${Math.floor(10000000 + Math.random() * 89999999)}`,
    userPhone: `07${Math.floor(10000000 + Math.random() * 89999999)}`,
    targetPhone: `0${[6, 7][Math.floor(Math.random() * 2)]}${Math.floor(10000000 + Math.random() * 89999999)}`,
    timestamp: Date.now() - (i + 2) * 180000,
    status: 'Pending' as const,
    costTokens: 1,
    costTsh: 40.00,
  }))
];

// Seed Deposits (115 records to match lblDepositsCount)
const SEED_DEPOSITS: DepositRecord[] = [
  {
    id: 'DEP-801',
    userPhone: '0784615052',
    amount: 1000.00,
    timestamp: Date.now() - 4 * 3600000,
    adminPhone: '0700000000',
    reference: 'MPESA-QW1289',
  },
  {
    id: 'DEP-802',
    userPhone: '0754112233',
    amount: 2000.00,
    timestamp: Date.now() - 6 * 3600000,
    adminPhone: '0700000000',
    reference: 'AIRTEL-TR8891',
  },
  ...Array.from({ length: 113 }, (_, i) => ({
    id: `DEP-${700 - i}`,
    userPhone: `07${Math.floor(10000000 + Math.random() * 89999999)}`,
    amount: [500, 1000, 2000, 5000][Math.floor(Math.random() * 4)],
    timestamp: Date.now() - (i + 1) * 3600000 * 2,
    adminPhone: '0700000000',
    reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
  }))
];

export const SystemStore = {
  // Get all users
  getUsers(): SystemUser[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure Eliya Amos Mwakyusa is Admin with password Eliya@123
          const eliyaIdx = parsed.findIndex((u: SystemUser) => u.phone === '0784615052');
          if (eliyaIdx !== -1) {
            parsed[eliyaIdx].role = 'admin';
            parsed[eliyaIdx].password = 'Eliya@123';
            parsed[eliyaIdx].credit = Math.max(parsed[eliyaIdx].credit || 0, 85000.00);
            parsed[eliyaIdx].fullName = 'Eliya Amos Mwakyusa (Admin)';
          } else {
            parsed.unshift({
              id: 'USR-0784615052',
              phone: '0784615052',
              password: 'Eliya@123',
              role: 'admin',
              credit: 85000.00,
              fullName: 'Eliya Amos Mwakyusa (Admin)',
              createdAt: Date.now() - 30 * 86400000,
            });
          }

          // Always ensure Eliya Amos Feeder is Feeder with password Eliya@123
          const feederIdx = parsed.findIndex((u: SystemUser) => u.phone === '0755461242');
          if (feederIdx !== -1) {
            parsed[feederIdx].role = 'feeder';
            parsed[feederIdx].password = 'Eliya@123';
            parsed[feederIdx].credit = Math.max(parsed[feederIdx].credit || 0, 15000.00);
            parsed[feederIdx].fullName = 'Eliya Amos (Feeder Officer)';
          } else {
            parsed.splice(1, 0, {
              id: 'USR-0755461242',
              phone: '0755461242',
              password: 'Eliya@123',
              role: 'feeder',
              credit: 15000.00,
              fullName: 'Eliya Amos (Feeder Officer)',
              createdAt: Date.now() - 25 * 86400000,
            });
          }

          return parsed;
        }
      }
    } catch {
      // ignore
    }
    this.saveUsers(SEED_USERS);
    return SEED_USERS;
  },

  saveUsers(users: SystemUser[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      window.dispatchEvent(new CustomEvent('nidatz_users_changed', { detail: users }));

      // Also ensure current active session reflects user changes immediately
      const current = this.getCurrentUser();
      if (current) {
        const fresh = users.find((u) => u.phone === current.phone);
        if (fresh) {
          if (fresh.isBlocked) {
            this.logout();
          } else if (fresh.credit !== current.credit || fresh.role !== current.role) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh));
            window.dispatchEvent(new CustomEvent('nidatz_auth_changed', { detail: fresh }));
          }
        } else {
          // User was deleted
          this.logout();
        }
      }
    } catch {
      // ignore
    }
  },

  getUser(phone: string): SystemUser | undefined {
    if (!phone) return undefined;
    const clean = phone.replace(/\D/g, '');
    return this.getUsers().find((u) => u.phone === clean || u.phone === phone);
  },

  getCurrentUser(): SystemUser | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) {
        let parsed: any = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = { phone: String(data) };
        }
        if (parsed && typeof parsed === 'object') {
          const phone = parsed.phone || parsed.userPhone;
          if (phone) {
            const fresh = this.getUser(phone);
            if (fresh) return fresh;
          }
          if (parsed.role && parsed.phone) {
            return {
              id: parsed.id || `USR-${parsed.phone}`,
              phone: parsed.phone,
              role: parsed.role,
              credit: typeof parsed.credit === 'number' ? parsed.credit : 240,
              fullName: parsed.fullName || '',
              createdAt: parsed.createdAt || Date.now(),
            };
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  setCurrentUser(user: SystemUser | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      window.dispatchEvent(new CustomEvent('nidatz_auth_changed', { detail: user }));
    } catch {
      // ignore
    }
  },

  findUser(identifier: string): SystemUser | undefined {
    if (!identifier) return undefined;
    const trimmed = identifier.trim();
    const cleanDigits = trimmed.replace(/\D/g, '');
    const lower = trimmed.toLowerCase();
    const users = this.getUsers();

    // 1. By exact or case-insensitive email
    let user = users.find((u) => u.email && u.email.toLowerCase() === lower);
    if (user) return user;

    // 2. By NIN (formatted or raw digits)
    if (cleanDigits.length >= 10 || trimmed.includes('-')) {
      user = users.find((u) => {
        if (!u.nin) return false;
        const uClean = u.nin.replace(/\D/g, '');
        return u.nin.toLowerCase() === lower || uClean === cleanDigits;
      });
      if (user) return user;
    }

    // 3. By phone number
    if (cleanDigits.length >= 9) {
      user = users.find((u) => u.phone === cleanDigits || u.phone.endsWith(cleanDigits));
      if (user) return user;
    }

    // 4. By ID
    user = users.find((u) => u.id === trimmed || u.id === `USR-${cleanDigits}`);
    return user;
  },

  login(identifier: string, password?: string): { success: boolean; user?: SystemUser; message?: string } {
    const raw = (identifier || '').trim();
    const users = this.getUsers();
    let user = this.findUser(raw);

    // Special guarantee for Eliya Amos Mwakyusa Admin account
    if (raw.includes('0784615052') || raw.toLowerCase().includes('admin@nidapass.go.tz')) {
      if (!user) {
        user = {
          id: 'USR-0784615052',
          phone: '0784615052',
          email: 'admin@nidapass.go.tz',
          nin: '19941208-14205-00129-22',
          password: 'Eliya@123',
          role: 'admin',
          credit: 85000.00,
          fullName: 'Eliya Amos Mwakyusa (Admin)',
          createdAt: Date.now() - 30 * 86400000,
        };
        users.unshift(user);
        this.saveUsers(users);
      } else {
        user.role = 'admin';
        user.password = 'Eliya@123';
      }
    }

    // Special guarantee for Eliya Amos Feeder account
    if (raw.includes('0755461242') || raw.toLowerCase().includes('feeder@nidapass.go.tz')) {
      if (!user) {
        user = {
          id: 'USR-0755461242',
          phone: '0755461242',
          email: 'feeder@nidapass.go.tz',
          nin: '19920714-33102-00045-18',
          password: 'Eliya@123',
          role: 'feeder',
          credit: 15000.00,
          fullName: 'Eliya Amos (Feeder Officer)',
          createdAt: Date.now() - 25 * 86400000,
        };
        users.splice(1, 0, user);
        this.saveUsers(users);
      } else {
        user.role = 'feeder';
        user.password = 'Eliya@123';
      }
    }

    if (!user) {
      this.logAuditAction({
        action: 'LOGIN_FAILED',
        actorPhone: raw || 'unknown',
        actorRole: 'guest',
        details: `Failed authentication attempt: Identity '${raw}' is not registered in the civil registry.`,
      });
      return { 
        success: false, 
        message: 'No citizen or authority record found matching this National ID, Email, or Phone. Please verify your credentials or register.' 
      };
    }

    if (user.isBlocked) {
      this.logAuditAction({
        action: 'LOGIN_BLOCKED_ATTEMPT',
        actorPhone: user.phone,
        actorRole: user.role,
        targetPhone: user.phone,
        targetName: user.fullName || user.phone,
        details: `Restricted pass attempt (${user.phone} - ${user.fullName || 'User'}) blocked by security firewall.`,
      });
      return { 
        success: false, 
        message: 'This account clearance has been restricted by civil registry administrators. Please contact the security desk.' 
      };
    }

    if (password && user.password && user.password !== password) {
      this.logAuditAction({
        action: 'LOGIN_FAILED',
        actorPhone: user.phone,
        actorRole: user.role,
        targetPhone: user.phone,
        targetName: user.fullName || user.phone,
        details: `Failed password verification for passholder ${user.fullName || user.phone}.`,
      });
      return { success: false, message: 'Invalid passkey or password. Please verify your credentials.' };
    }

    // Log activity
    this.addUserActivityLog({
      userId: user.phone,
      type: 'AUTH',
      title: 'Portal Access Authorized',
      description: `Authenticated via secure gateway with clearance ${user.verificationTier || 'Tier 3'}.`,
      ipAddress: '197.250.48.112',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 35) : 'Secure Terminal',
      status: 'SUCCESS',
      timestamp: Date.now(),
    });

    user.lastLogin = Date.now();
    this.setCurrentUser(user);
    this.logAuditAction({
      action: 'LOGIN_SUCCESS',
      actorPhone: user.phone,
      actorRole: user.role,
      targetPhone: user.phone,
      targetName: user.fullName || user.phone,
      details: `${user.role.toUpperCase()}: ${user.fullName || user.phone} successfully authenticated into NIDA Pass Portal.`,
    });
    return { success: true, user };
  },

  getUserActivityLogs(userIdOrPhone: string): UserActivityLog[] {
    const key = 'nidapass_user_activity_v1';
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userLogs = parsed.filter((log: UserActivityLog) => 
            log.userId === userIdOrPhone || 
            (log.userId && log.userId.includes(userIdOrPhone))
          );
          if (userLogs.length > 0) return userLogs;
        }
      }
    } catch {}

    const seedLogs: UserActivityLog[] = [
      {
        id: 'ACT-1092',
        userId: userIdOrPhone,
        type: 'AUTH',
        title: 'Citizen Pass Session Initialized',
        description: 'Single Sign-On authentication verified with TLS 1.3 cryptographic session token.',
        ipAddress: '197.250.48.112',
        device: 'Chrome 128 / macOS (Dodoma Gateway)',
        status: 'SUCCESS',
        timestamp: Date.now() - 5 * 60000,
      },
      {
        id: 'ACT-1089',
        userId: userIdOrPhone,
        type: 'VERIFY',
        title: 'National Identity Credential Verification',
        description: 'Biometric registry validation: Level-3 Facial and Fingerprint hash synchronized.',
        ipAddress: '197.250.48.112',
        device: 'Civil Registration Terminal 08',
        status: 'SUCCESS',
        timestamp: Date.now() - 32 * 60000,
      },
      {
        id: 'ACT-1074',
        userId: userIdOrPhone,
        type: 'SECURITY',
        title: 'Cryptographic Pass Barcode Refreshed',
        description: 'Digital Pass QR signature re-signed with SHA-256 national public key.',
        ipAddress: '102.164.88.24',
        device: 'GovPass Gateway Mobile Agent',
        status: 'SUCCESS',
        timestamp: Date.now() - 3.5 * 3600000,
      },
      {
        id: 'ACT-1061',
        userId: userIdOrPhone,
        type: 'AUTH',
        title: 'Multi-Factor Device Handshake',
        description: 'Registered MSISDN telecom link verified via TCRA central database.',
        ipAddress: '102.164.88.24',
        device: 'Mobile Pass Wallet (Safari)',
        status: 'SUCCESS',
        timestamp: Date.now() - 25 * 3600000,
      },
      {
        id: 'ACT-1045',
        userId: userIdOrPhone,
        type: 'PASS_UPDATE',
        title: 'Official NIDA Pass Slip Clearance',
        description: 'Official citizen verification certificate PDF rendered and authenticated.',
        ipAddress: '196.192.80.14',
        device: 'NIDA Regional Center Terminal',
        status: 'SUCCESS',
        timestamp: Date.now() - 72 * 3600000,
      },
    ];

    try {
      localStorage.setItem(key, JSON.stringify(seedLogs));
    } catch {}
    return seedLogs;
  },

  addUserActivityLog(log: Omit<UserActivityLog, 'id'>): void {
    const key = 'nidapass_user_activity_v1';
    try {
      let existing: UserActivityLog[] = [];
      const data = localStorage.getItem(key);
      if (data) {
        existing = JSON.parse(data);
      }
      const newEntry: UserActivityLog = {
        ...log,
        id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      existing.unshift(newEntry);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
    } catch {}
  },

  logout(): void {
    this.setCurrentUser(null);
  },

  changePassword(phone: string, newPassword: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.phone === phone);
    if (index === -1) {
      return { success: false, message: 'User not found in registry.' };
    }
    users[index].password = newPassword;
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.phone === phone) {
      current.password = newPassword;
      this.setCurrentUser(current);
    }
    return { success: true, message: 'Password imebadilishwa kikamilifu!' };
  },

  // Requests management
  getRequests(): NidaServiceRequest[] {
    try {
      const data = localStorage.getItem(REQUESTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    this.saveRequests(SEED_REQUESTS);
    return SEED_REQUESTS;
  },

  saveRequests(reqs: NidaServiceRequest[]): void {
    try {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
      window.dispatchEvent(new CustomEvent('nidatz_requests_changed', { detail: reqs }));
    } catch {
      // ignore
    }
  },

  submitRequest(requesterPhone: string, customerPhone: string, customerName?: string): { success: boolean; message: string; request?: NidaServiceRequest } {
    const cleanCust = customerPhone.replace(/\D/g, '');
    if (cleanCust.length !== 10 || (!cleanCust.startsWith('06') && !cleanCust.startsWith('07'))) {
      return { success: false, message: 'Namba ya simu ya mteja lazima ianze na 07 au 06 na iwe na tarakimu 10!' };
    }

    // Check user balance
    const user = this.getUser(requesterPhone);
    if (!user) {
      return { success: false, message: 'Akaunti ya mtumiaji haijapatikana.' };
    }

    if (user.credit < REQUEST_COST_TSH) {
      return { success: false, message: `Insufficient balance! Each request costs TSh ${REQUEST_COST_TSH.toFixed(2)}. Please top up your wallet account.` };
    }

    // Deduct 40 Tsh
    user.credit = Math.max(0, user.credit - REQUEST_COST_TSH);
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.phone === user.phone);
    if (idx !== -1) {
      users[idx] = user;
      this.saveUsers(users);
    }

    const current = this.getCurrentUser();
    if (current && current.phone === user.phone) {
      this.setCurrentUser(user);
    }

    // Create request
    const newReq: NidaServiceRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: `USR-${user.phone}`,
      userPhone: user.phone,
      targetPhone: cleanCust,
      applicantName: customerName || undefined,
      timestamp: Date.now(),
      status: 'Pending',
      costTokens: 1,
      costTsh: REQUEST_COST_TSH,
    };

    const requests = [newReq, ...this.getRequests()];
    this.saveRequests(requests);

    return {
      success: true,
      message: `Ombi lako la namba ${cleanCust} limetumwa kikamilifu! TSh ${REQUEST_COST_TSH.toFixed(2)} imekatwa kutoka salio lako.`,
      request: newReq,
    };
  },

  fulfillRequest(requestId: string, nidaNumber: string, adminNotes?: string): { success: boolean; message: string } {
    const cleanNin = nidaNumber.trim();
    if (!cleanNin || cleanNin.length < 8) {
      return { success: false, message: 'Tafadhali ingiza namba kamili na sahihi ya NIDA kabla ya kutuma.' };
    }

    const requests = this.getRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) {
      return { success: false, message: 'Ombi halikupatikana.' };
    }

    requests[idx].status = 'Completed';
    requests[idx].nidaNumber = cleanNin;
    requests[idx].completedAt = Date.now();
    requests[idx].adminNotes = adminNotes || 'NIDA imehakikiwa na kusambazwa na Afisa wa NIDA.';

    this.saveRequests(requests);

    const currentActor = this.getCurrentUser();
    this.logAuditAction({
      action: 'NIDA_REQUEST_FULFILLED',
      actorPhone: currentActor ? currentActor.phone : '0784615052',
      actorRole: currentActor ? currentActor.role : 'admin',
      targetPhone: requests[idx].targetPhone,
      targetName: requests[idx].applicantName || requests[idx].targetPhone,
      details: `Afisa amekamilisha ombi la NIDA kwa namba ${requests[idx].targetPhone}. NIN iliyotolewa: ${cleanNin}.`,
      metadata: { requestId, nidaNumber: cleanNin, userPhone: requests[idx].userPhone },
    });

    return { success: true, message: 'NIDA imetumwa kikamilifu! Mteja anaweza kuiona mara moja.' };
  },

  // Deposits
  getDeposits(): DepositRecord[] {
    try {
      const data = localStorage.getItem(DEPOSITS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    this.saveDeposits(SEED_DEPOSITS);
    return SEED_DEPOSITS;
  },

  saveDeposits(deposits: DepositRecord[]): void {
    try {
      localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits));
      window.dispatchEvent(new CustomEvent('nidatz_deposits_changed', { detail: deposits }));
    } catch {
      // ignore
    }
  },

  addDeposit(userPhone: string, amount: number, adminPhone = '0700000000'): { success: boolean; message: string; newBalance?: number } {
    const clean = userPhone.replace(/\D/g, '');
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.phone === clean);
    if (idx === -1) {
      return { success: false, message: `Mtumiaji mwenye namba ${clean} hajapatikana kwenye mfumo.` };
    }

    if (amount < 100) {
      return { success: false, message: 'Kiwango cha chini cha kuweka salio ni TSh 100.' };
    }

    users[idx].credit = (users[idx].credit || 0) + amount;
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.phone === clean) {
      current.credit = users[idx].credit;
      this.setCurrentUser(current);
    }

    // Log deposit
    const deposit: DepositRecord = {
      id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      userPhone: clean,
      amount,
      timestamp: Date.now(),
      adminPhone,
      reference: `DEP-TX-${Date.now().toString().slice(-6)}`,
    };

    const deposits = [deposit, ...this.getDeposits()];
    this.saveDeposits(deposits);

    // Sync with remote server so changes are accessible immediately anywhere
    try {
      fetch('/api/users/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, amount, adminPhone }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'CREDIT_ADDED',
      actorPhone: adminPhone,
      actorRole: 'admin',
      targetPhone: clean,
      targetName: users[idx].fullName || clean,
      details: `Admin (${adminPhone}) amemwongezea TSh ${amount.toLocaleString()} mtumiaji ${clean}. Salio jipya: TSh ${users[idx].credit.toFixed(2)}.`,
      metadata: { amount, newBalance: users[idx].credit, reference: deposit.reference },
    });

    return {
      success: true,
      message: `Deposit ya TSh ${amount.toLocaleString()} imekamilika kwa namba ${clean}! Salio jipya: TSh ${users[idx].credit.toFixed(2)}.`,
      newBalance: users[idx].credit,
    };
  },

  addUser(user: Omit<SystemUser, 'id' | 'createdAt'>): { success: boolean; message: string; user?: SystemUser } {
    const clean = user.phone.replace(/\D/g, '');
    if (clean.length !== 10 || (!clean.startsWith('06') && !clean.startsWith('07'))) {
      return { success: false, message: 'Namba ya simu lazima ianze na 07 au 06 na iwe na tarakimu 10!' };
    }

    const users = this.getUsers();
    if (users.some((u) => u.phone === clean)) {
      return { success: false, message: 'Mtumiaji mwenye namba hii tayari yupo kwenye mfumo.' };
    }

    const newUser: SystemUser = {
      ...user,
      id: `USR-${clean}`,
      phone: clean,
      createdAt: Date.now(),
      credit: user.credit || 0.00,
    };

    users.unshift(newUser);
    this.saveUsers(users);

    const currentAdmin = this.getCurrentUser();

    // Sync with remote server so registered user can login from any device immediately
    try {
      fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          password: user.password || 'password123',
          role: user.role,
          credit: user.credit || 0,
          fullName: user.fullName,
          adminPhone: currentAdmin ? currentAdmin.phone : '0784615052',
        }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'USER_CREATED',
      actorPhone: currentAdmin ? currentAdmin.phone : '0784615052',
      actorRole: currentAdmin ? currentAdmin.role : 'admin',
      targetPhone: clean,
      targetName: newUser.fullName || clean,
      details: `Akaunti mpya ya mtumiaji ${clean} (Nafasi: ${newUser.role}, Salio: TSh ${newUser.credit.toFixed(2)}) imesajiliwa kikamilifu.`,
      metadata: { role: newUser.role, initialCredit: newUser.credit },
    });

    return { success: true, message: `Akaunti ya mtumiaji ${clean} imetengenezwa kikamilifu na salio linapatikana moja kwa moja!`, user: newUser };
  },

  updateUserCredit(phone: string, newCredit: number): { success: boolean; message: string } {
    const clean = phone.replace(/\D/g, '');
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.phone === clean);
    if (idx === -1) return { success: false, message: 'User not found.' };

    const oldCredit = users[idx].credit;
    users[idx].credit = Math.max(0, newCredit);
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.phone === clean) {
      current.credit = users[idx].credit;
      this.setCurrentUser(current);
    }

    // Sync with remote server
    try {
      fetch('/api/users/update-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          credit: users[idx].credit,
          adminPhone: current ? current.phone : '0784615052',
        }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'CREDIT_UPDATED',
      actorPhone: current ? current.phone : '0784615052',
      actorRole: current ? current.role : 'admin',
      targetPhone: clean,
      targetName: users[idx].fullName || clean,
      details: `Salio la mtumiaji ${clean} limerekebishwa kutoka TSh ${oldCredit.toFixed(2)} hadi TSh ${newCredit.toFixed(2)}.`,
      metadata: { oldCredit, newCredit },
    });

    return { success: true, message: `Salio la ${clean} limewekwa TSh ${newCredit.toFixed(2)}.` };
  },

  blockUser(phone: string, isBlocked: boolean): { success: boolean; message: string } {
    const clean = phone.replace(/\D/g, '');
    if (clean === '0784615052') {
      return { success: false, message: 'Huwezi kumfungia Super Admin wa mfumo!' };
    }
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.phone === clean);
    if (idx === -1) return { success: false, message: 'Mtumiaji hajapatikana.' };

    users[idx].isBlocked = isBlocked;
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.phone === clean) {
      if (isBlocked) {
        this.logout();
      } else {
        current.isBlocked = false;
        this.setCurrentUser(current);
      }
    }

    // Sync block with remote server
    try {
      fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          isBlocked,
          adminPhone: current ? current.phone : '0784615052',
        }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      actorPhone: current ? current.phone : '0784615052',
      actorRole: current ? current.role : 'admin',
      targetPhone: clean,
      targetName: users[idx].fullName || clean,
      details: isBlocked
        ? `Mtumiaji ${clean} amefungwa (Blocked) na hawezi kuingia kwenye mfumo au kufanya miamala.`
        : `Mtumiaji ${clean} amefunguliwa (Unblocked) na amerudishwa kuwa hai kwenye mfumo.`,
      metadata: { isBlocked },
    });

    return {
      success: true,
      message: isBlocked ? `Mtumiaji ${clean} amefungwa (blocked) mara moja na hawezi kuingia popote.` : `Mtumiaji ${clean} amefunguliwa na sasa yuko hai.`
    };
  },

  deleteUser(phone: string): { success: boolean; message: string } {
    const clean = phone.replace(/\D/g, '');
    if (clean === '0784615052') {
      return { success: false, message: 'Huwezi kumfuta Super Admin wa mfumo!' };
    }
    let users = this.getUsers();
    const existing = users.find((u) => u.phone === clean);
    if (!existing) {
      return { success: false, message: 'Mtumiaji hajapatikana kwenye mfumo.' };
    }
    users = users.filter((u) => u.phone !== clean);
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.phone === clean) {
      this.logout();
    }

    // Sync delete with remote server
    try {
      fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          adminPhone: current ? current.phone : '0784615052',
        }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'USER_DELETED',
      actorPhone: current ? current.phone : '0784615052',
      actorRole: current ? current.role : 'admin',
      targetPhone: clean,
      targetName: existing.fullName || clean,
      details: `Mtumiaji ${clean} (${existing.fullName || 'User'}) amefutwa kabisa kwenye mfumo na data zake kuondolewa.`,
      metadata: { deletedPhone: clean, role: existing.role },
    });

    return { success: true, message: `Mtumiaji ${clean} amefutwa kabisa kwenye mfumo.` };
  },

  searchUsers(query: string): SystemUser[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.getUsers().filter((u) => u.phone.includes(q) || (u.fullName && u.fullName.toLowerCase().includes(q)));
  },

  // Credit Requests Management
  getCreditRequests(): CreditRequest[] {
    try {
      const data = localStorage.getItem(CREDIT_REQUESTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    this.saveCreditRequests(SEED_CREDIT_REQUESTS);
    return SEED_CREDIT_REQUESTS;
  },

  saveCreditRequests(reqs: CreditRequest[]): void {
    try {
      localStorage.setItem(CREDIT_REQUESTS_KEY, JSON.stringify(reqs));
      window.dispatchEvent(new CustomEvent('nidatz_credit_requests_changed', { detail: reqs }));
    } catch {
      // ignore
    }
  },

  submitCreditRequest(params: {
    userPhone: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    notes?: string;
  }): { success: boolean; message: string; request?: CreditRequest } {
    const clean = params.userPhone.replace(/\D/g, '');
    const user = this.getUser(clean);
    if (!user) {
      return { success: false, message: 'Akaunti ya mtumiaji haijapatikana.' };
    }
    if (user.isBlocked) {
      return { success: false, message: 'Akaunti yako imefungwa na Admin, huwezi kuomba salio.' };
    }

    if (!params.amount || params.amount < 100) {
      return { success: false, message: 'Kiwango cha chini cha kuomba salio ni TSh 100.' };
    }

    if (!params.transactionRef || params.transactionRef.trim().length < 3) {
      return { success: false, message: 'Tafadhali ingiza kumbukumbu au namba sahihi ya muamala (Transaction ID).' };
    }

    const newReq: CreditRequest = {
      id: `CR-${Math.floor(1000 + Math.random() * 9000)}`,
      userPhone: clean,
      userName: user.fullName || clean,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionRef: params.transactionRef.trim().toUpperCase(),
      notes: params.notes?.trim() || undefined,
      status: 'Pending',
      timestamp: Date.now(),
    };

    const requests = [newReq, ...this.getCreditRequests()];
    this.saveCreditRequests(requests);

    // Sync credit request with remote backend
    try {
      fetch('/api/credit-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'CREDIT_REQUEST_SUBMITTED',
      actorPhone: clean,
      actorRole: user.role,
      targetPhone: clean,
      targetName: user.fullName || clean,
      details: `Ombi la salio TSh ${params.amount.toLocaleString()} limewasilishwa kupitia ${params.paymentMethod} (Kumb: ${newReq.transactionRef}).`,
      metadata: { amount: params.amount, paymentMethod: params.paymentMethod, transactionRef: newReq.transactionRef },
    });

    return {
      success: true,
      message: `Ombi lako la kuongeza TSh ${params.amount.toLocaleString()} limetumwa kwa Admin kwa uhakiki!`,
      request: newReq,
    };
  },

  approveCreditRequest(requestId: string, adminPhone = '0784615052'): { success: boolean; message: string } {
    const requests = this.getCreditRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, message: 'Ombi halikupatikana.' };

    const req = requests[idx];
    if (req.status !== 'Pending') {
      return { success: false, message: `Ombi hili tayari lipo katika hali ya ${req.status}.` };
    }

    // Add deposit directly to user
    const depositResult = this.addDeposit(req.userPhone, req.amount, adminPhone);
    if (!depositResult.success) {
      return { success: false, message: depositResult.message };
    }

    requests[idx].status = 'Approved';
    requests[idx].reviewedAt = Date.now();
    requests[idx].reviewedBy = adminPhone;

    this.saveCreditRequests(requests);

    // Sync approval with remote backend
    try {
      fetch('/api/credit-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, adminPhone }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'CREDIT_REQUEST_APPROVED',
      actorPhone: adminPhone,
      actorRole: 'admin',
      targetPhone: req.userPhone,
      targetName: req.userName || req.userPhone,
      details: `Admin (${adminPhone}) ameidhinisha ombi la salio la TSh ${req.amount.toLocaleString()} kwa ${req.userPhone} (Ref: ${req.transactionRef}).`,
      metadata: { requestId, amount: req.amount, transactionRef: req.transactionRef },
    });

    return {
      success: true,
      message: `Ombi limeidhinishwa! TSh ${req.amount.toLocaleString()} imeongezwa kwenye akaunti ya ${req.userPhone}.`,
    };
  },

  rejectCreditRequest(requestId: string, reason?: string, adminPhone = '0784615052'): { success: boolean; message: string } {
    const requests = this.getCreditRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, message: 'Ombi halikupatikana.' };

    const req = requests[idx];
    requests[idx].status = 'Rejected';
    requests[idx].reviewedAt = Date.now();
    requests[idx].reviewedBy = adminPhone;
    requests[idx].rejectionReason = reason || 'Uhakiki wa malipo haukukamilika au taarifa si sahihi.';

    this.saveCreditRequests(requests);

    // Sync rejection with remote backend
    try {
      fetch('/api/credit-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, reason: requests[idx].rejectionReason, adminPhone }),
      }).catch(() => {});
    } catch {}

    this.logAuditAction({
      action: 'CREDIT_REQUEST_REJECTED',
      actorPhone: adminPhone,
      actorRole: 'admin',
      targetPhone: req.userPhone,
      targetName: req.userName || req.userPhone,
      details: `Admin (${adminPhone}) amekataa ombi la salio la TSh ${req.amount.toLocaleString()} kwa ${req.userPhone}. Sababu: ${requests[idx].rejectionReason}`,
      metadata: { requestId, amount: req.amount, reason: requests[idx].rejectionReason },
    });

    return {
      success: true,
      message: `Ombi la namba ${requests[idx].userPhone} limekataliwa.`,
    };
  },

  getStats() {
    const requests = this.getRequests();
    const users = this.getUsers();
    const deposits = this.getDeposits();
    const creditRequests = this.getCreditRequests();

    const pendingCount = requests.filter((r) => r.status === 'Pending').length;
    const completedCount = requests.filter((r) => r.status === 'Completed').length;
    const pendingCreditRequestsCount = creditRequests.filter((r) => r.status === 'Pending').length;

    // Today filter: within current calendar day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const todayCount = requests.filter((r) => r.timestamp >= startOfToday).length;

    return {
      pendingCount,
      completedCount,
      totalUsersCount: users.length,
      depositsCount: deposits.length,
      todayCount,
      pendingCreditRequestsCount,
    };
  },

  // Sinsoft API Key Management
  getUserApiKey(phone: string): string {
    const user = this.getUser(phone);
    if (!user) return `sin_live_${phone.replace(/\D/g, '')}x99`;
    if (user.apiKey) return user.apiKey;
    // Generate deterministic default key
    const generated = `sin_live_${phone.replace(/\D/g, '')}_${Math.random().toString(36).substring(2, 8)}`;
    user.apiKey = generated;
    this.updateUser(user);
    return generated;
  },

  regenerateApiKey(phone: string): string {
    const user = this.getUser(phone);
    const newKey = `sin_live_${phone.replace(/\D/g, '')}_${Math.random().toString(36).substring(2, 10)}`;
    if (user) {
      user.apiKey = newKey;
      this.updateUser(user);
    }
    return newKey;
  },

  saveWebhookUrl(phone: string, webhookUrl: string): boolean {
    const user = this.getUser(phone);
    if (!user) return false;
    user.webhookUrl = webhookUrl.trim();
    this.updateUser(user);
    return true;
  },

  updateUser(updatedUser: SystemUser): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.phone === updatedUser.phone);
    if (idx !== -1) {
      users[idx] = updatedUser;
      this.saveUsers(users);
    }
    const current = this.getCurrentUser();
    if (current && current.phone === updatedUser.phone) {
      this.setCurrentUser(updatedUser);
    }
  },

  deductUserCredit(userPhone: string, amount: number): { success: boolean; newBalance: number; message: string } {
    const user = this.getUser(userPhone);
    if (!user) {
      return { success: false, newBalance: 0, message: 'Mtumiaji hajapatikana.' };
    }
    if (user.credit < amount) {
      return { 
        success: false, 
        newBalance: user.credit, 
        message: `Salio halitoshi! Ombi linahitaji TSh ${amount.toFixed(2)}, lakini salio lako ni TSh ${user.credit.toFixed(2)}.` 
      };
    }
    user.credit = Math.max(0, user.credit - amount);
    user.totalApiCalls = (user.totalApiCalls || 0) + 1;
    this.updateUser(user);
    return { success: true, newBalance: user.credit, message: 'Salio limekatwa kikamilifu.' };
  },

  // API Call Logs
  getApiLogs(userPhone?: string): ApiLogEntry[] {
    try {
      const data = localStorage.getItem(API_LOGS_KEY);
      if (data) {
        const parsed: ApiLogEntry[] = JSON.parse(data);
        if (Array.isArray(parsed)) {
          if (userPhone) {
            return parsed.filter((l) => l.userPhone === userPhone);
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  },

  logApiCall(entry: Omit<ApiLogEntry, 'id' | 'timestamp'>): ApiLogEntry {
    const logs = this.getApiLogs();
    const newEntry: ApiLogEntry = {
      ...entry,
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...logs.slice(0, 199)]; // keep latest 200 logs
    try {
      localStorage.setItem(API_LOGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sinsoft_api_logs_changed', { detail: updated }));
    } catch {
      // ignore
    }
    return newEntry;
  },

  // Audit Logs (Track user actions, credit approvals, account deletions, blocks & logins)
  getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(AUDIT_LOGS_KEY);
      if (data) {
        const parsed: AuditLogEntry[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    this.saveAuditLogs(SEED_AUDIT_LOGS);
    return SEED_AUDIT_LOGS;
  },

  saveAuditLogs(logs: AuditLogEntry[]): void {
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('nidatz_audit_logs_changed', { detail: logs }));
    } catch {
      // ignore
    }
  },

  logAuditAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...logs.slice(0, 299)]; // Keep latest 300 audit logs
    this.saveAuditLogs(updated);
    return newEntry;
  },

  clearAuditLogs(): void {
    this.saveAuditLogs([]);
  },

  // Remote Realtime Synchronization ("hata kama yuko mbali")
  async syncWithServer(): Promise<void> {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        const serverUsers: SystemUser[] = data.users;
        
        // Save server users to local storage and sync active session
        localStorage.setItem(USERS_KEY, JSON.stringify(serverUsers));
        window.dispatchEvent(new CustomEvent('nidatz_users_changed', { detail: serverUsers }));

        const current = this.getCurrentUser();
        if (current) {
          const fresh = serverUsers.find((u) => u.phone === current.phone);
          if (fresh) {
            if (fresh.isBlocked) {
              this.logout();
            } else if (fresh.credit !== current.credit || fresh.role !== current.role) {
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh));
              window.dispatchEvent(new CustomEvent('nidatz_auth_changed', { detail: fresh }));
            }
          } else if (current.phone !== '0784615052') {
            // User was deleted remotely
            this.logout();
          }
        }

        if (Array.isArray(data.requests)) {
          localStorage.setItem(REQUESTS_KEY, JSON.stringify(data.requests));
          window.dispatchEvent(new CustomEvent('nidatz_requests_changed', { detail: data.requests }));
        }
        if (Array.isArray(data.creditRequests)) {
          localStorage.setItem(CREDIT_REQUESTS_KEY, JSON.stringify(data.creditRequests));
          window.dispatchEvent(new CustomEvent('nidatz_credit_requests_changed', { detail: data.creditRequests }));
        }
        if (Array.isArray(data.deposits)) {
          localStorage.setItem(DEPOSITS_KEY, JSON.stringify(data.deposits));
          window.dispatchEvent(new CustomEvent('nidatz_deposits_changed', { detail: data.deposits }));
        }
        if (Array.isArray(data.auditLogs)) {
          localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(data.auditLogs));
          window.dispatchEvent(new CustomEvent('nidatz_audit_logs_changed', { detail: data.auditLogs }));
        }
      }
    } catch {
      // offline or server still starting
    }
  },

  resetData(): void {
    this.saveUsers(SEED_USERS);
    this.saveRequests(SEED_REQUESTS);
    this.saveDeposits(SEED_DEPOSITS);
    this.saveCreditRequests(SEED_CREDIT_REQUESTS);
    this.saveAuditLogs(SEED_AUDIT_LOGS);
    const defaultUser = SEED_USERS[2]; // Eliya
    this.setCurrentUser(defaultUser);
  }
};

// Auto-start remote sync loop in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    SystemStore.syncWithServer();
  }, 100);

  // Poll every 2500ms so user credits and accounts update in real-time even from afar
  setInterval(() => {
    SystemStore.syncWithServer();
  }, 2500);
}

