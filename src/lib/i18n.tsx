import React from 'react';
import { Globe } from 'lucide-react';
import { Language, useLanguage } from '../context/LanguageContext';

export const portalCopy: Record<
  Language,
  {
    // Global & Auth
    appTagline: string;
    authHeroTitle: string;
    authHeroDesc: string;
    stdServiceFee: string;
    creditsPerReq: string;
    creditConversionRate: string;
    supportHelpline: string;
    accountLogin: string;
    createAccount: string;
    signInTitle: string;
    signInSubtitle: string;
    phoneLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    enterPasswordPlaceholder: string;
    signingIn: string;
    loginBtn: string;
    newToApp: string;
    registerHereBtn: string;
    createAccountTitle: string;
    createAccountSubtitle: string;
    regField1: string;
    regField1Placeholder: string;
    regField2: string;
    regField3: string;
    regField3Placeholder: string;
    creatingAccount: string;
    createAccountBtn: string;
    alreadyRegistered: string;
    backToLogin: string;
    authorizedNotice: string;
    passwordRecoveryTitle: string;
    passwordRecoveryDesc: string;
    regPhonePlaceholder: string;
    close: string;
    submitting: string;
    requestReset: string;
    adminPortalBtn: string;
    signInBtnTop: string;
    registerHereTop: string;

    // User Portal Nav & Overview
    availableCredits: string;
    buyCreditsBtn: string;
    newRequestBtn: string;
    logoutBtn: string;
    welcomeBack: string;
    notifications: string;
    noNotifications: string;
    navDashboard: string;
    navNewRequest: string;
    navMyRequests: string;
    navCompleted: string;
    navBuyCredits: string;
    navPaymentHistory: string;
    navCreditHistory: string;
    navProfile: string;
    mobileHome: string;
    mobileRequest: string;
    mobileCredits: string;
    mobileOrders: string;
    userDashboardLabel: string;
    accountPhone: string;
    kpiTotalRequests: string;
    kpiSubmitted: string;
    kpiCompleted: string;
    kpiServices: string;
    serviceCategories: string;
    viewAllServices: string;
    recentRequests: string;
    allRequests: string;
    noRequestsYet: string;
    startFirstRequest: string;
    colRequestId: string;
    colService: string;
    colDate: string;
    colCredits: string;
    colStatus: string;
    servicesCountTag: string;

    // Services & Requests
    availableServicesTitle: string;
    availableServicesDesc: string;
    allServicesFilter: string;
    startRequestBtn: string;
    myRequestsTitle: string;
    completedRequestsTitle: string;
    requestsDesc: string;
    refreshBtn: string;
    noCompletedYet: string;
    browseServicesBtn: string;
    viewDetails: string;
    hideDetails: string;
    yourSubmittedDocs: string;
    rejectionReason: string;
    authorizedResult: string;
    downloadBtn: string;

    // Request Wizard
    backToServices: string;
    stepReq: string;
    stepDetails: string;
    stepReview: string;
    insufficientCreditsTitle: string;
    buyCreditsNow: string;
    step1Title: string;
    reqInfoAndDocs: string;
    officialNoticeWizard: string;
    cancelBtn: string;
    continueToFields: string;
    step2Title: string;
    supportedFormatsNote: string;
    reqUploadsTitle: string;
    chooseFileLabel: string;
    backBtn: string;
    reviewInfoBtn: string;
    step3Title: string;
    step3Desc: string;
    selectedService: string;
    creditFee: string;
    attachedDocs: string;
    editDetails: string;
    submitRequestBtn: string;
    submittingRequest: string;

    // Buy Credits & Packages
    buyCreditsTitle: string;
    dsnActiveBadge: string;
    dsnNotReadyBadge: string;
    buyCreditsSubtitle: string;
    selectPackageLabel: string;
    depositAmountLabel: string;
    minDepositHint: string;
    payPhoneLabel: string;
    expectedCreditsLabel: string;
    rateLabel: string;
    payNowBtn: string;
    sendingPrompt: string;
    activeOrderLabel: string;
    autoPollHint: string;
    verifyNowBtn: string;
    verifyingDsn: string;
    recentPaymentsTitle: string;
    noPaymentsYet: string;
    checkStatusBtn: string;
    paymentHistoryTitle: string;
    creditHistoryTitle: string;
    currentBalanceLabel: string;

    // Profile
    accountInfoTitle: string;
    fullNameLabel: string;
    regPhoneLabel: string;
    memberSinceLabel: string;
    logoutAccountBtn: string;
    changePasswordTitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    updatePasswordBtn: string;
    updatingPassword: string;

    // Status Badges
    statusSubmitted: string;
    statusCompleted: string;
    statusRejected: string;
    statusPending: string;
    statusSuccess: string;
    statusFailed: string;

    // PWA
    installApp: string;
    installAppTitle: string;
    installAppDesc: string;
    installNowBtn: string;
    laterBtn: string;
    installIosBtn: string;
    iosGuideTitle: string;
    iosGuideStep1: string;
    iosGuideStep2: string;
    browserGuideTitle: string;
    browserGuideIframeNote: string;
    openFullTabBtn: string;
    browserGuideStep1: string;
    browserGuideStep2: string;
    offlineNotice: string;
  }
> = {
  sw: {
    appTagline: 'Mlango Rasmi wa Huduma',
    authHeroTitle: 'Huduma za NIDA, Nyaraka za Biashara & Till za Simu',
    authHeroDesc:
      'Tuma maombi rasmi ya huduma, pakia nyaraka zako kwa usalama, nunua credits kupitia DSN Mobile Money, na pakua nyaraka zilizokamilika moja kwa moja kwenye dashibodi yako.',
    stdServiceFee: 'Gharama ya Huduma',
    creditsPerReq: 'Credits / Ombi',
    creditConversionRate: 'Kiwango cha Credit',
    supportHelpline: 'Namba ya Msaada',
    accountLogin: 'Ingia Akaunti',
    createAccount: 'Fungua Akaunti',
    signInTitle: 'Ingia Kwenye Akaunti Yako',
    signInSubtitle: 'Weka namba yako ya simu iliyosajiliwa na nenosiri lako.',
    phoneLabel: 'Namba ya Simu',
    passwordLabel: 'Nenosiri (Password)',
    forgotPassword: 'Umesahau Nenosiri?',
    enterPasswordPlaceholder: 'Weka nenosiri lako',
    signingIn: 'Inaingia...',
    loginBtn: 'INGIA',
    newToApp: 'Mgeni kwenye DIGITAL SALES PRO MAX?',
    registerHereBtn: 'REGISTER HERE — Fungua Akaunti Mpya',
    createAccountTitle: 'Fungua Akaunti Mpya',
    createAccountSubtitle: 'Usajili wa haraka. Haihitaji anwani ya barua pepe (Email).',
    regField1: '1. Jina Kamili (Majina Matatu)',
    regField1Placeholder: 'Jina la Kwanza la Kati na la Mwisho',
    regField2: '2. Namba ya Simu',
    regField3: '3. Nenosiri (Angalau herufi au tarakimu 4)',
    regField3Placeholder: 'Angalau herufi au namba 4',
    creatingAccount: 'Inatengeneza Akaunti...',
    createAccountBtn: 'Fungua Akaunti Mpya',
    alreadyRegistered: 'Tayari umeshasajiliwa?',
    backToLogin: 'Rudi Kwenye Kuingia',
    authorizedNotice: 'Huduma zote zinachakatwa kupitia taratibu halali na idhini ya watoa huduma husika.',
    passwordRecoveryTitle: 'Kurejesha Nenosiri',
    passwordRecoveryDesc:
      'Ingiza namba yako ya simu iliyosajiliwa ili kutuma ombi la uhakiki wa kurejesha nenosiri kwa msimamizi.',
    regPhonePlaceholder: 'Namba ya simu iliyosajiliwa',
    close: 'Funga',
    submitting: 'Inatuma...',
    requestReset: 'Omba Msaada',
    adminPortalBtn: 'Admin Portal',
    signInBtnTop: 'INGIA',
    registerHereTop: 'REGISTER HERE',

    availableCredits: 'Credits Zilizopo',
    buyCreditsBtn: 'NUNUA CREDITS',
    newRequestBtn: 'OMBI JIPYA',
    logoutBtn: 'ONDOKA',
    welcomeBack: 'Karibu tena,',
    notifications: 'Taarifa (Notifications)',
    noNotifications: 'Hakuna taarifa mpya kwa sasa.',
    navDashboard: 'Dashibodi',
    navNewRequest: 'Ombi Jipya',
    navMyRequests: 'Maombi Yangu',
    navCompleted: 'Zilizokamilika',
    navBuyCredits: 'Nunua Credits',
    navPaymentHistory: 'Historia ya Malipo',
    navCreditHistory: 'Historia ya Credits',
    navProfile: 'Mipangilio ya Akaunti',
    mobileHome: 'Mwanzo',
    mobileRequest: 'Omba',
    mobileCredits: 'Credits',
    mobileOrders: 'Maombi',
    userDashboardLabel: 'DIGITAL SALES PRO MAX · Dashibodi ya Mtumiaji',
    accountPhone: 'Simu ya Akaunti',
    kpiTotalRequests: 'Jumla ya Maombi',
    kpiSubmitted: 'Yaliyotumwa',
    kpiCompleted: 'Yaliyokamilika',
    kpiServices: 'Huduma Zilizopo',
    serviceCategories: 'Makundi ya Huduma',
    viewAllServices: 'Tazama Huduma Zote',
    recentRequests: 'Maombi ya Hivi Karibuni',
    allRequests: 'Maombi Yote',
    noRequestsYet: 'Bado hujatuma ombi lolote la huduma.',
    startFirstRequest: 'Anza Ombi Lako la Kwanza',
    colRequestId: 'Namba ya Ombi',
    colService: 'Huduma',
    colDate: 'Tarehe',
    colCredits: 'Credits',
    colStatus: 'Hali',
    servicesCountTag: 'huduma · credits 2/ombi',

    availableServicesTitle: 'Huduma Zinazopatikana',
    availableServicesDesc: 'Chagua huduma hapa chini ili kuona mahitaji na kutuma ombi lako rasmi.',
    allServicesFilter: 'Huduma Zote',
    startRequestBtn: 'Anza Ombi',
    myRequestsTitle: 'Maombi Yangu',
    completedRequestsTitle: 'Maombi Yaliyokamilika & Kupakua',
    requestsDesc: 'Fuatilia hali ya maombi yako na pakua matokeo halali yaliyokamilika.',
    refreshBtn: 'Onyesha Upya',
    noCompletedYet: 'Hakuna maombi yaliyokamilika tayari kwa kupakua bado.',
    browseServicesBtn: 'Tazama Huduma',
    viewDetails: 'Tazama Maelezo',
    hideDetails: 'Ficha Maelezo',
    yourSubmittedDocs: 'Nyaraka Ulizopakia',
    rejectionReason: 'Sababu ya Kukataliwa:',
    authorizedResult: 'Matokeo Rasmi ya Huduma',
    downloadBtn: 'Pakua',

    backToServices: 'Rudi Kwenye Huduma',
    stepReq: 'Mahitaji',
    stepDetails: 'Taarifa & Nyaraka',
    stepReview: 'Hakiki & Tuma',
    insufficientCreditsTitle: 'Salio la Credits Halitoshi',
    buyCreditsNow: 'Nunua Credits Sasa',
    step1Title: 'Hatua ya 1: Maelezo ya Huduma na Mahitaji Rasmi',
    reqInfoAndDocs: 'Taarifa na Nyaraka Zinazohitajika',
    officialNoticeWizard:
      'Ilani ya Uchakataji Rasmi: Huduma zote za NIDA, nyaraka za biashara, na usajili wa Till hufanyika kwa taratibu halali. Nyaraka zilizokamilika hutumwa baada ya uhakiki.',
    cancelBtn: 'Ghairi',
    continueToFields: 'Endelea Kujaza Taarifa',
    step2Title: 'Hatua ya 2: Jaza Taarifa na Pakia Nyaraka',
    supportedFormatsNote: 'Aina za faili zinazokubalika: PDF, JPG, JPEG, PNG (Upeo MB 10 kwa faili).',
    reqUploadsTitle: 'Nyaraka Zinazohitajika Kupakiwa',
    chooseFileLabel: 'Chagua PDF, JPG, JPEG, au PNG',
    backBtn: 'Nyuma',
    reviewInfoBtn: 'Hakiki Taarifa',
    step3Title: 'Hatua ya 3: Hakiki na Thibitisha Kutuma',
    step3Desc: 'Kagua taarifa zote kabla ya kutuma. Kiasi cha credits kitakatwa ukithibitisha.',
    selectedService: 'Huduma Iliyochaguliwa',
    creditFee: 'Gharama ya Credits',
    attachedDocs: 'Nyaraka Zilizopakiwa',
    editDetails: 'Hariri Taarifa',
    submitRequestBtn: 'SUBMIT REQUEST / TUMA OMBI',
    submittingRequest: 'Inatuma Ombi...',

    buyCreditsTitle: 'Nunua Credits (Mobile Money)',
    dsnActiveBadge: 'Mfumo wa DSN Uko Tayari',
    dsnNotReadyBadge: 'Inasubiri DSN Key',
    buyCreditsSubtitle:
      'Malipo rasmi kupitia DSN Technology (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa). Kiwango ni TSh 100 = 1 Credit, kuanzia kifurushi cha TSh 1,000.',
    selectPackageLabel: 'Chagua Kifurushi cha Credits (Kuanzia TSh 1,000)',
    depositAmountLabel: 'Kiasi cha Kulipa (TSh — Kianzio TSh 1,000)',
    minDepositHint: 'Kiwango cha chini cha kuweka ni TSh 1,000 (Credits 10).',
    payPhoneLabel: 'Namba ya Simu ya Kulipia (Mobile Money)',
    expectedCreditsLabel: 'Credits Utakazopata',
    rateLabel: 'Kiwango',
    payNowBtn: 'PAY NOW / LIPA SASA',
    sendingPrompt: 'Inatuma Ombi Kwenye Simu...',
    activeOrderLabel: 'Oda ya Malipo Inayoendelea',
    autoPollHint: 'Angalia simu yako ({phone}) na ingiza PIN yako ya Mobile Money. Mfumo unahakiki malipo kiotomatiki kila sekunde 4.',
    verifyNowBtn: 'Hakiki Malipo Sasa',
    verifyingDsn: 'Inahakiki na DSN...',
    recentPaymentsTitle: 'Hali ya Malipo ya Hivi Karibuni',
    noPaymentsYet: 'Bado hujaanzisha malipo yoyote.',
    checkStatusBtn: 'Hakiki Hali ya Malipo',
    paymentHistoryTitle: 'Historia ya Malipo',
    creditHistoryTitle: 'Historia ya Miamala ya Credits',
    currentBalanceLabel: 'Salio la Sasa',

    accountInfoTitle: 'Taarifa za Akaunti',
    fullNameLabel: 'Jina Kamili',
    regPhoneLabel: 'Namba ya Simu Iliyosajiliwa',
    memberSinceLabel: 'Mwanachama Tangu',
    logoutAccountBtn: 'ONDOKA KWENYE AKAUNTI',
    changePasswordTitle: 'Badilisha Nenosiri',
    currentPasswordLabel: 'Nenosiri la Sasa',
    newPasswordLabel: 'Nenosiri Jipya (Angalau herufi 4)',
    confirmPasswordLabel: 'Thibitisha Nenosiri Jipya',
    updatePasswordBtn: 'Hifadhi Nenosiri Jipya',
    updatingPassword: 'Inasasisha...',

    statusSubmitted: 'Imetumwa',
    statusCompleted: 'Imekamilika',
    statusRejected: 'Imekataliwa',
    statusPending: 'Inasubiri',
    statusSuccess: 'Imefanikiwa',
    statusFailed: 'Imeshindwa',

    installApp: 'Sakinisha App',
    installAppTitle: 'Sakinisha App ya DIGITAL SALES PRO MAX',
    installAppDesc: 'Weka app hii moja kwa moja kwenye skrini ya simu au kompyuta yako kwa matumizi ya haraka bila kivinjari.',
    installNowBtn: 'SAKINISHA SASA',
    laterBtn: 'Baadaye',
    installIosBtn: 'Weka Kwenye iPhone',
    iosGuideTitle: 'Weka Kwenye iPhone / iPad',
    iosGuideStep1: '1. Bofya kitufe cha Share (mraba wenye mshale kwenda juu) chini ya Safari.',
    iosGuideStep2: '2. Shuka chini na uchague "Add to Home Screen" kisha bofya Add.',
    browserGuideTitle: 'Sakinisha App Kwenye Kifaa Chako',
    browserGuideIframeNote: 'Uko ndani ya dirisha la hakikisho (preview frame). Fungua kwenye tab mpya ili usakinishe app moja kwa moja.',
    openFullTabBtn: 'Fungua Kwenye Tab Mpya Ili Usakinishe',
    browserGuideStep1: '1. Bofya menyu ya kivinjari chako (⋮ juu kulia kwenye Chrome / Android au ikoni ya Install kwenye anwani ya juu).',
    browserGuideStep2: '2. Chagua "Install DIGITAL SALES PRO MAX" au "Add to Home screen".',
    offlineNotice: 'Huna Mtandao (Offline) — Baadhi ya taarifa zinaonekana kutoka kumbukumbu.',
  },
  en: {
    appTagline: 'Authorized Services Gateway',
    authHeroTitle: 'NIDA, Business Documents & Mobile Till Services',
    authHeroDesc:
      'Submit authorized service requests, upload supporting documents securely, purchase credits via DSN mobile money, and download completed official documents directly from your dashboard.',
    stdServiceFee: 'Standard Service Fee',
    creditsPerReq: 'Credits / Request',
    creditConversionRate: 'Credit Conversion Rate',
    supportHelpline: 'Support Helpline',
    accountLogin: 'Account Login',
    createAccount: 'Create Account',
    signInTitle: 'Sign In to Your Account',
    signInSubtitle: 'Enter your registered mobile phone number and password.',
    phoneLabel: 'Phone Number',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot Password?',
    enterPasswordPlaceholder: 'Enter your password',
    signingIn: 'Signing In...',
    loginBtn: 'Login',
    newToApp: 'New to DIGITAL SALES PRO MAX?',
    registerHereBtn: 'REGISTER HERE — Create New Account',
    createAccountTitle: 'Create New Account',
    createAccountSubtitle: 'Fast independent registration. No email address required.',
    regField1: '1. Full Name (Three Names)',
    regField1Placeholder: 'First Middle Last Name',
    regField2: '2. Phone Number',
    regField3: '3. Password (Minimum 4 characters or digits)',
    regField3Placeholder: 'At least 4 characters or digits',
    creatingAccount: 'Creating Account...',
    createAccountBtn: 'Create New Account',
    alreadyRegistered: 'Already registered?',
    backToLogin: 'Back to Login',
    authorizedNotice: 'All services are processed through authorized procedures and official provider approvals.',
    passwordRecoveryTitle: 'Password Recovery',
    passwordRecoveryDesc:
      'Enter your registered phone number to log a password recovery verification request with the administrator.',
    regPhonePlaceholder: 'Registered phone number',
    close: 'Close',
    submitting: 'Submitting...',
    requestReset: 'Request Reset',
    adminPortalBtn: 'Admin Portal',
    signInBtnTop: 'SIGN IN',
    registerHereTop: 'REGISTER HERE',

    availableCredits: 'Available Credits',
    buyCreditsBtn: 'BUY CREDITS',
    newRequestBtn: 'NEW REQUEST',
    logoutBtn: 'LOGOUT',
    welcomeBack: 'Welcome back,',
    notifications: 'Notifications',
    noNotifications: 'No notifications yet.',
    navDashboard: 'Dashboard',
    navNewRequest: 'New Request',
    navMyRequests: 'My Requests',
    navCompleted: 'Completed Requests',
    navBuyCredits: 'Buy Credits',
    navPaymentHistory: 'Payment History',
    navCreditHistory: 'Credit History',
    navProfile: 'Profile Settings',
    mobileHome: 'Home',
    mobileRequest: 'Request',
    mobileCredits: 'Credits',
    mobileOrders: 'Orders',
    userDashboardLabel: 'DIGITAL SALES PRO MAX · User Dashboard',
    accountPhone: 'Account Phone',
    kpiTotalRequests: 'Total Requests',
    kpiSubmitted: 'Submitted',
    kpiCompleted: 'Completed',
    kpiServices: 'Available Services',
    serviceCategories: 'Service Categories',
    viewAllServices: 'View All Services',
    recentRequests: 'Recent Requests',
    allRequests: 'All Requests',
    noRequestsYet: 'You have not submitted any service requests yet.',
    startFirstRequest: 'Start Your First Request',
    colRequestId: 'Request ID',
    colService: 'Service',
    colDate: 'Date',
    colCredits: 'Credits',
    colStatus: 'Status',
    servicesCountTag: 'services · 2 credits/request',

    availableServicesTitle: 'Available Services',
    availableServicesDesc: 'Select a service below to review requirements and submit an authorized request.',
    allServicesFilter: 'All Services',
    startRequestBtn: 'Start Request',
    myRequestsTitle: 'My Requests',
    completedRequestsTitle: 'Completed Requests & Downloads',
    requestsDesc: 'Track status updates and download authorized completed service results.',
    refreshBtn: 'Refresh',
    noCompletedYet: 'No completed requests are ready for download yet.',
    browseServicesBtn: 'Browse Services',
    viewDetails: 'View Details',
    hideDetails: 'Hide Details',
    yourSubmittedDocs: 'Your Submitted Documents',
    rejectionReason: 'Rejection Reason:',
    authorizedResult: 'Authorized Service Result',
    downloadBtn: 'Download',

    backToServices: 'Back to Services',
    stepReq: 'Requirements',
    stepDetails: 'Details & Docs',
    stepReview: 'Review & Submit',
    insufficientCreditsTitle: 'Insufficient Credit Balance',
    buyCreditsNow: 'Buy Credits Now',
    step1Title: 'Step 1: Service Description & Official Requirements',
    reqInfoAndDocs: 'Required Information & Documents',
    officialNoticeWizard:
      'Official Processing Notice: All NIDA services, document filings, and Till applications are submitted through authorized procedures and official provider approvals.',
    cancelBtn: 'Cancel',
    continueToFields: 'Continue to Document Fields',
    step2Title: 'Step 2: Enter Required Information & Upload Documents',
    supportedFormatsNote: 'Supported document formats: PDF, JPG, JPEG, PNG (Max 10 MB per file).',
    reqUploadsTitle: 'Required Document Uploads',
    chooseFileLabel: 'Choose PDF, JPG, JPEG, or PNG',
    backBtn: 'Back',
    reviewInfoBtn: 'Review Information',
    step3Title: 'Step 3: Review & Confirm Submission',
    step3Desc: 'Verify all details below before submitting. Credits will be deducted upon submission.',
    selectedService: 'Selected Service',
    creditFee: 'Credit Fee',
    attachedDocs: 'Attached Documents',
    editDetails: 'Edit Details',
    submitRequestBtn: 'SUBMIT REQUEST',
    submittingRequest: 'Submitting Request...',

    buyCreditsTitle: 'Buy Credits via Mobile Money',
    dsnActiveBadge: 'DSN Gateway Active',
    dsnNotReadyBadge: 'Gateway Key Required in Secrets',
    buyCreditsSubtitle:
      'Official DSN Technology mobile money collection (M-Pesa, Mixx by Yas, Airtel Money, HaloPesa). Rate: TSh 100 = 1 Credit, packages starting from TSh 1,000.',
    selectPackageLabel: 'Select Credit Package (Starting at TSh 1,000)',
    depositAmountLabel: 'Deposit Amount (TSh — Min TSh 1,000)',
    minDepositHint: 'Minimum deposit is TSh 1,000 (10 Credits).',
    payPhoneLabel: 'Mobile Money Phone Number',
    expectedCreditsLabel: 'Expected Credits',
    rateLabel: 'Rate',
    payNowBtn: 'PAY NOW',
    sendingPrompt: 'Sending Mobile Payment Prompt...',
    activeOrderLabel: 'Active Payment Order',
    autoPollHint: 'Check your phone ({phone}) and enter your Mobile Money PIN. Status auto-checks every 4 seconds.',
    verifyNowBtn: 'Verify Payment Status Now',
    verifyingDsn: 'Verifying with DSN...',
    recentPaymentsTitle: 'Recent Payment Statuses',
    noPaymentsYet: 'No payment orders initiated yet.',
    checkStatusBtn: 'Check Payment Status',
    paymentHistoryTitle: 'Payment History',
    creditHistoryTitle: 'Credit Transaction History',
    currentBalanceLabel: 'Current Balance',

    accountInfoTitle: 'Account Information',
    fullNameLabel: 'Full Name',
    regPhoneLabel: 'Registered Phone Number',
    memberSinceLabel: 'Member Since',
    logoutAccountBtn: 'LOGOUT OF ACCOUNT',
    changePasswordTitle: 'Change Password',
    currentPasswordLabel: 'Current Password',
    newPasswordLabel: 'New Password (Min 4 chars)',
    confirmPasswordLabel: 'Confirm New Password',
    updatePasswordBtn: 'Update Password',
    updatingPassword: 'Updating Password...',

    statusSubmitted: 'Submitted',
    statusCompleted: 'Completed',
    statusRejected: 'Rejected',
    statusPending: 'Pending',
    statusSuccess: 'Success',
    statusFailed: 'Failed',

    installApp: 'Install App',
    installAppTitle: 'Install DIGITAL SALES PRO MAX App',
    installAppDesc: 'Add this app directly to your phone or computer home screen for instant standalone access.',
    installNowBtn: 'INSTALL NOW',
    laterBtn: 'Later',
    installIosBtn: 'Install on iPhone',
    iosGuideTitle: 'Install on iPhone / iPad',
    iosGuideStep1: '1. Tap the Share button (square with upward arrow) in Safari toolbar.',
    iosGuideStep2: '2. Scroll down and tap "Add to Home Screen", then tap Add.',
    browserGuideTitle: 'Install App on Your Device',
    browserGuideIframeNote: 'You are viewing inside an embedded preview frame. Open in a full browser tab to enable one-tap installation.',
    openFullTabBtn: 'Open in Full Tab to Install',
    browserGuideStep1: '1. Open your browser menu (⋮ at top-right on Chrome/Android, or the Install icon in the address bar).',
    browserGuideStep2: '2. Select "Install DIGITAL SALES PRO MAX" or "Add to Home screen".',
    offlineNotice: 'Offline Mode — Cached app shell is active.',
  },
};

export function usePortalCopy() {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  return {
    language,
    setLanguage,
    toggleLanguage,
    copy: portalCopy[language],
  };
}

export const LanguageToggleButton: React.FC<{ variant?: 'dark' | 'light' }> = ({
  variant = 'light',
}) => {
  const { language, setLanguage } = useLanguage();
  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center rounded-lg p-0.5 border text-[11px] font-bold shrink-0 ${
        isDark
          ? 'bg-[#10203F] border-slate-700 text-slate-300'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
      role="group"
      aria-label="Language switcher"
    >
      <Globe className={`w-3.5 h-3.5 mx-1.5 ${isDark ? 'text-[#D4AF37]' : 'text-[#0B162C]'}`} />
      <button
        type="button"
        onClick={() => setLanguage('sw')}
        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
          language === 'sw'
            ? isDark
              ? 'bg-[#D4AF37] text-[#0B162C]'
              : 'bg-[#0B162C] text-white'
            : 'hover:opacity-80'
        }`}
      >
        SW
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
          language === 'en'
            ? isDark
              ? 'bg-[#D4AF37] text-[#0B162C]'
              : 'bg-[#0B162C] text-white'
            : 'hover:opacity-80'
        }`}
      >
        EN
      </button>
    </div>
  );
};
