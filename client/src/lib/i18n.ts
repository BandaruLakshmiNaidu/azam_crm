import { useState, useEffect } from 'react';

// Language type
export type Language = 'en' | 'sw';

// Translation interface
export interface Translations {
  [key: string]: string | Translations;
}

// English translations
const englishTranslations: Translations = {
  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    agentManagement: 'Agent Management',
    searchSubscriber: 'Search Subscriber',
    subscriberView: 'Subscriber View',
    subscriptionPurchase: 'Subscription Purchase',
    subscriptionRenewal: 'Subscription Renewal',
    planChange: 'Plan Change',
    addAddonPacks: 'Add Addon Packs',
    customerSuspension: 'Customer Suspension',
    customerRegistration: 'Customer Registration',
    consolidatedSubscriptions: 'Consolidated Subscriptions',
    logout: 'Logout'
  },
  
  // Common UI elements
  common: {
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    add: 'Add',
    update: 'Update',
    submit: 'Submit',
    close: 'Close',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    filter: 'Filter',
    export: 'Export',
    clear: 'Clear',
    refresh: 'Refresh',
    showAll: 'Show All',
    profile: 'Profile',
    settings: 'Settings',
    searchHistory: 'Search History',
    popularSearches: 'Popular Searches'
  },

  // Dashboard
  dashboard: {
    title: 'AZAM TV Agent Portal',
    subtitle: 'Comprehensive management system for field agents',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    statistics: 'Statistics',
    totalSubscribers: 'Total Subscribers',
    activeSubscribers: 'Active Subscribers',
    totalAgents: 'Total Agents',
    monthlyRevenue: 'Monthly Revenue',
    systemHealth: 'System Health',
    networkStatus: 'Network Status',
    coverage: 'Coverage',
    excellent: 'Excellent',
    lastUpdated: 'Last Updated',
    refreshData: 'Refresh Data',
    revenueSubscriptionTrends: 'Revenue & Subscription Trends',
    months: 'Months',
    revenue: 'Revenue',
    newSubscriptions: 'New Subscriptions',
    regionalPerformance: 'Regional Performance',
    subscribers: 'subscribers',
    dailyActivityOverview: 'Daily Activity Overview',
    newSubs: 'New Subs',
    payments: 'Payments',
    support: 'Support',
    packageDistribution: 'Package Distribution',
    recentActivities: 'Recent Activities',
    viewAll: 'View All',
    newCustomer: 'New Customer',
    registerSubscriber: 'Register subscriber',
    processPayment: 'Process Payment',
    handlePayment: 'Handle payment',
    viewReports: 'View Reports',
    analyticsInsights: 'Analytics & insights',
    manageInventory: 'Manage Inventory',
    stockControl: 'Stock control',
    systemMonitor: 'System Monitor',
    healthStatus: 'Health status',
    customerSupport: 'Customer Support',
    helpTickets: 'Help & tickets',
    azamPremium: 'Azam Premium',
    azamPlus: 'Azam Plus',
    azamLite: 'Azam Lite',
    azamUltra: 'Azam Ultra',
    newPremiumSubscription: 'New Premium subscription',
    paymentReceived: 'Payment received',
    hardwareDeliveryCompleted: 'Hardware delivery completed',
    autoRenewalProcessed: 'Auto renewal processed',
    planChange: 'Plan change',
    liteToPlus: 'Lite to Plus',
    system: 'System',
    agent: 'Agent',
    customers: 'customers',
    minAgo: 'min ago',
    darEsSalaam: 'Dar es Salaam',
    arusha: 'Arusha',
    mwanza: 'Mwanza',
    dodoma: 'Dodoma',
    mbeya: 'Mbeya',
    morogoro: 'Morogoro'
  },

  // Search Subscriber
  searchSubscriber: {
    title: 'Search Subscriber',
    subtitle: 'Find and view subscriber information directly',
    searchTerm: 'Search Term',
    searchType: 'Search Type',
    allFields: 'All Fields',
    customerName: 'Customer Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    smartCardNumber: 'Smart Card Number',
    sapBpId: 'SAP BP ID',
    findAndView: 'Find & View Subscriber',
    searchTips: 'Search Tips',
    searchTipsText: 'Use partial matches for names, enter complete numbers for phone/smart card searches. Search will take you directly to the subscriber\'s profile.',
    noSubscriberFound: 'No subscriber found matching your search criteria. Please try different search terms.',
    enterSearchTerm: 'Please enter a search term',
    placeholder: 'Enter name, phone, email, smart card number, or SAP BP ID...'
  },

  // Subscriber View
  subscriberView: {
    title: 'Subscriber Profile',
    overview: 'Overview',
    subscriptions: 'Subscriptions',
    hardware: 'Hardware',
    history: 'History',
    billing: 'Billing',
    customerInfo: 'Customer Information',
    accountDetails: 'Account Details',
    subscriptionInfo: 'Subscription Information',
    currentPlan: 'Current Plan',
    status: 'Status',
    endDate: 'End Date',
    walletBalance: 'Wallet Balance',
    viewDetails: 'View Details',
    active: 'Active',
    suspended: 'Suspended',
    disconnected: 'Disconnected',
    terminated: 'Terminated'
  },

  // Agent Management
  agentManagement: {
    title: 'Agent Management',
    subtitle: 'Manage field agents and their performance',
    addAgent: 'Add New Agent',
    agentList: 'Agent List',
    agentName: 'Agent Name',
    email: 'Email',
    phone: 'Phone',
    region: 'Region',
    performance: 'Performance',
    actions: 'Actions'
  },

  // Customer Registration
  customerRegistration: {
    title: 'Customer Registration',
    subtitle: 'Register new customers',
    personalInfo: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    region: 'Region',
    customerType: 'Customer Type',
    prepaid: 'Prepaid',
    postpaid: 'Postpaid',
    registerCustomer: 'Register Customer'
  },

  // Subscription Management
  subscription: {
    purchase: 'Purchase Subscription',
    renewal: 'Renew Subscription',
    planChange: 'Change Plan',
    addAddon: 'Add Addon Pack',
    suspension: 'Suspend Customer',
    planName: 'Plan Name',
    amount: 'Amount',
    duration: 'Duration',
    features: 'Features',
    selectPlan: 'Select Plan',
    paymentMethod: 'Payment Method',
    wallet: 'Wallet',
    mobileMoney: 'Mobile Money',
    bankTransfer: 'Bank Transfer'
  },

  // Statistics
  stats: {
    total: 'Total',
    active: 'Active',
    suspended: 'Suspended',
    disconnected: 'Disconnected',
    subscribers: 'Subscribers',
    agents: 'Agents',
    revenue: 'Revenue',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    growth: 'Growth'
  },

  // Time and dates
  time: {
    today: 'Today',
    yesterday: 'Yesterday',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years',
    ago: 'ago'
  },

  // Navigation
  nav: {
    home: 'Home',
    onboarding: 'Onboarding',
    inventory: 'Inventory',
    payments: 'Payments',
    subscriptions: 'Subscriptions',
    adjustment: 'Adjustment',
    serviceTicketing: 'Service Ticketing',
    bulkProvision: 'Bulk Provision',
    agentCommission: 'Agent Commission',
    provisioning: 'Provisioning',
    dashboard: 'Dashboard',
    reports: 'Reports'
  },

  // Navigation Submenus
  navSubmenus: {
    // Onboarding submenu
    onboarding: {
      agentManagement: 'Agent Management',
      agentManagementDesc: 'Manage agent onboarding and profiles',
      customerManagement: 'Customer Management',
      customerManagementDesc: 'Register new customers and manage accounts',
      kycVerification: 'KYC Verification',
      kycVerificationDesc: 'Review and approve agent KYC documents'
    },
    
    // Inventory submenu
    inventory: {
      stockOverview: 'Stock Overview',
      stockOverviewDesc: 'View current stock levels',
      stockRequest: 'Stock Request',
      stockRequestDesc: 'Request new inventory',
      stockApproval: 'Stock Approval',
      stockApprovalDesc: 'Approve stock requests',
      stockTransfer: 'Stock Transfer',
      stockTransferDesc: 'Transfer between locations',
      warehouseTransfer: 'Warehouse Transfer',
      warehouseTransferDesc: 'Warehouse operations',
      trackSerial: 'Track Serial Numbers',
      trackSerialDesc: 'Track device serials',
      casIdChange: 'CAS ID Change',
      casIdChangeDesc: 'Update device CAS IDs',
      stbScPairing: 'STB-SC Pairing',
      stbScPairingDesc: 'Pair devices with cards',
      blockUnblockAgent: 'Block/Unblock Agent',
      blockUnblockAgentDesc: 'Control agent access',
      blockUnblockCenter: 'Block/Unblock Center',
      blockUnblockCenterDesc: 'Control center access',
      purchaseOrders: 'Purchase Orders',
      purchaseOrdersDesc: 'View purchase orders',
      grnUpdate: 'GRN Update',
      grnUpdateDesc: 'Update receipt notes',
      agentHardwareSale: 'Agent Hardware Sale',
      agentHardwareSaleDesc: 'Record agent sales',
      customerHardwareSale: 'Customer Hardware Sale',
      customerHardwareSaleDesc: 'Record customer sales',
      hardwareReturns: 'Hardware Returns',
      hardwareReturnsDesc: 'Process returns',
      agentReplacement: 'Agent Replacement',
      agentReplacementDesc: 'Agent transfers',
      faultyRepair: 'Faulty Repair',
      faultyRepairDesc: 'Report equipment faults'
    },
    
    // Payment submenu
    payment: {
      agentPaymentHW: 'Agent Payment - HW',
      agentPaymentHWDesc: 'Hardware payment processing',
      agentPaymentSubscription: 'Agent Payment - Subscription',
      agentPaymentSubscriptionDesc: 'Subscription payment processing',
      customerPaymentHW: 'Customer Payment - HW',
      customerPaymentHWDesc: 'Customer hardware payments',
      customerPaymentSubscription: 'Customer Payment - Subscription',
      customerPaymentSubscriptionDesc: 'Customer subscription payments',
      receiptCancellation: 'Receipt Cancellation',
      receiptCancellationDesc: 'Cancel payment receipts',
      customerTransfer: 'Customer To Customer Transfer',
      customerTransferDesc: 'Transfer between customers'
    },
    
    // Subscriptions submenu
    subscriptions: {
      searchSubscriber: 'Search Subscriber',
      searchSubscriberDesc: 'Find customer subscriptions'
    },
    
    // Adjustment submenu
    adjustment: {
      createAdjustment: 'Create Adjustment',
      createAdjustmentDesc: 'Create new adjustments',
      adjustmentApproval: 'Adjustment Approval',
      adjustmentApprovalDesc: 'Approve pending adjustments'
    },
    
    // Service Ticketing submenu
    serviceTicketing: {
      serviceTicketing: 'Service Ticketing',
      serviceTicketingDesc: 'Raise service-related tickets',
      newIncident: 'New Incident',
      newIncidentDesc: 'Create new service desk incidents'
    },
    
    // Bulk Provision submenu
    bulkProvision: {
      newUploadView: 'New Upload & View',
      newUploadViewDesc: 'New & Upload bulk provisioning file'
    },
    
    // Agent Commission submenu
    agentCommission: {
      viewCommission: 'View Commission',
      viewCommissionDesc: 'View agent commissions'
    },
    
    // Provisioning submenu
    provisioning: {
      provisioning: 'Provisioning',
      provisioningDesc: 'On-Screen Display management'
    },
    
    // Reports submenu
    reports: {
      dailyReports: 'Daily Reports',
      dailyReportsDesc: 'View daily operational reports',
      traReports: 'TRA Reports',
      traReportsDesc: 'View TRA reports',
      tcraReports: 'TCRA Reports',
      tcraReportsDesc: 'View TCRA reports'
    }
  },

  // Home page
  home: {
    title: 'AZAM TV Portal',
    subtitle: 'Choose a service module to get started',
    welcomeMessage: 'Welcome to AZAM TV Agent Management System',
    modules: 'Service Modules',
    getStarted: 'Get Started',
    quickActions: 'Quick Actions',
    coreModules: 'Core Modules',
    analyticsModules: 'Analytics & Reports',
    operationsModules: 'Operations',
    newAgent: 'New Agent',
    newAgentDesc: 'Register a new agent',
    newCustomer: 'New Customer',
    newCustomerDesc: 'Register a new customer',
    updateInventory: 'Update Inventory',
    updateInventoryDesc: 'Add or update inventory items',
    processPayment: 'Process Payment',
    processPaymentDesc: 'Record a new payment',
    agentManagement: 'Agent Management',
    agentManagementDesc: 'Manage agent onboarding and profiles',
    customerManagement: 'Customer Management', 
    customerManagementDesc: 'Register new customers and manage accounts',
    inventoryManagement: 'Inventory Management',
    inventoryManagementDesc: 'Track set-top boxes and smart cards',
    paymentProcessing: 'Payment Processing',
    paymentProcessingDesc: 'Handle hardware and subscription payments',
    subscriptionManagement: 'Subscription Management',
    subscriptionManagementDesc: 'Manage TV packages and subscriptions',
    reportsAnalytics: 'Reports & Analytics',
    reportsAnalyticsDesc: 'View performance metrics and reports',
    adjustment: 'Adjustment',
    adjustmentDesc: 'Account and billing adjustments',
    serviceTicketing: 'Service Ticketing',
    serviceTicketingDesc: 'Customer service ticket management',
    bulkProvision: 'Bulk Provision',
    bulkProvisionDesc: 'Mass provisioning operations',
    agentCommission: 'Agent Commission',
    agentCommissionDesc: 'Commission management and tracking'
  },

  // Forms and validation
  forms: {
    required: 'This field is required',
    invalid: 'Invalid input',
    emailInvalid: 'Please enter a valid email address',
    phoneInvalid: 'Please enter a valid phone number',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    selectOption: 'Please select an option'
  },

  // Service operations
  services: {
    suspension: 'Suspension',
    suspensionDesc: 'Suspend subscriber services',
    reconnection: 'Reconnection', 
    reconnectionDesc: 'Reconnect suspended services',
    disconnection: 'Disconnection',
    disconnectionDesc: 'Disconnect subscriber services',
    termination: 'Termination',
    terminationDesc: 'Terminate subscriber accounts',
    retrack: 'Retrack',
    retrackDesc: 'Retrack service connections',
    replacement: 'Replacement',
    replacementDesc: 'Replace equipment and services',
    paymentTransactions: 'Payment Transactions',
    paymentTransactionsDesc: 'View and manage payment records',
    serviceTransactions: 'Service Transactions',
    serviceTransactionsDesc: 'Track service transaction history'
  },

  // Subscription Modules
  subscriptionModule: {
    title: 'Subscription Management',
    subtitle: '19 Modules Available', 
    searchSubscriber: 'Search Subscriber',
    searchSubscriberDesc: 'Find customer subscription details',
    subscriberView: 'Subscriber View',
    subscriberViewDesc: 'View complete subscriber profile',
    subscriberManagement: 'Subscriber Management',
    subscriptionOperations: 'Subscription Operations',
    serviceManagement: 'Service Management',
    transactionManagement: 'Transaction Management',
    billingInvoicing: 'Billing & Invoicing',
    quickActions: 'Quick Actions'
  },

  // Inventory
  inventory: {
    title: 'Inventory Management',
    subtitle: 'Manage hardware inventory and tracking',
    stockOverview: 'Stock Overview',
    stockRequest: 'Stock Request',
    stockApproval: 'Stock Approval',
    stockTransfer: 'Stock Transfer',
    trackSerial: 'Track Serial',
    casIdChange: 'CAS ID Change',
    stbScPairing: 'STB-SC Pairing',
    warehouseTransfer: 'Warehouse Transfer',
    blockUnblockAgent: 'Block/Unblock Agent',
    blockUnblockCenter: 'Block/Unblock Center',
    pogrnUpdate: 'PO/GRN Update',
    poView: 'PO View',
    customerHardwareReturn: 'Customer Hardware Return',
    agentReplacement: 'Agent Replacement',
    agentFaultyRepair: 'Agent Faulty Repair',
    agentPaymentHW: 'Agent Payment HW',
    agentHardwareSale: 'Agent Hardware Sale',
    customerHardwareSale: 'Customer Hardware Sale',
    customerPaymentHW: 'Customer Payment HW'
  },

  // Hardware and technical
  hardware: {
    stbModel: 'STB Model',
    stbSerial: 'STB Serial Number',
    smartCard: 'Smart Card',
    smartCardNumber: 'Smart Card Number',
    warrantyStatus: 'Warranty Status',
    condition: 'Condition',
    working: 'Working',
    faulty: 'Faulty',
    damaged: 'Damaged',
    purchaseDate: 'Purchase Date',
    warrantyEnd: 'Warranty End Date'
  },

  // Login and authentication
  auth: {
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    forgotPassword: 'Forgot Password',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    rememberMe: 'Remember Me',
    invalidCredentials: 'Invalid username or password',
    sessionExpired: 'Your session has expired',
    welcomeBack: 'Welcome Back',
    pleaseSignIn: 'Please sign in to continue',
    welcomeMessage: 'Access your AZAM TV agent management portal and streamline your operations with our intelligent platform.',
    secureReliableProfessional: 'Secure • Reliable • Professional',
    emailAddress: 'Email Address',
    enterCredentials: 'Enter your credentials to continue',
    emailPlaceholder: 'your.email@company.com',
    passwordPlaceholder: 'Enter your password',
    forgotPasswordQuestion: 'Forgot your password?',
    signingIn: 'Signing in...',
    signInToDashboard: 'Sign In to Dashboard',
    needAssistance: 'Need assistance?',
    contactSupport: 'Contact Support',
    loginFailed: 'Login Failed',
    invalidEmailPassword: 'Invalid email or password',
    resetPassword: 'Reset Password',
    resetPasswordMessage: 'Enter your email address and we\'ll send you a verification code',
    enterEmailAddress: 'Enter your email address',
    sendVerificationCode: 'Send Verification Code',
    sending: 'Sending...',
    verifyCode: 'Verify Code',
    verifyCodeMessage: 'Enter the 6-digit code sent to',
    verifying: 'Verifying...',
    didntReceiveCode: 'Didn\'t receive the code?',
    resendCode: 'Resend Code',
    resendInSeconds: 'Resend in',
    resending: 'Resending...',
    newPassword: 'New Password',
    newPasswordMessage: 'Choose a strong password for your account',
    confirmPassword: 'Confirm Password',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm new password',
    updating: 'Updating...',
    updatePassword: 'Update Password',
    backToLogin: 'Back to Login',
    otpSent: 'OTP Sent',
    otpSentMessage: 'Please check your email for the verification code',
    otpVerified: 'OTP Verified',
    otpVerifiedMessage: 'Please enter your new password',
    passwordUpdated: 'Password Updated',
    passwordUpdatedMessage: 'Your password has been successfully updated',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password Too Short',
    passwordMinLength: 'Password must be at least 6 characters',
    otpResent: 'OTP Resent',
    otpResentMessage: 'A new verification code has been sent to your email',
    failedToSendOtp: 'Failed to send OTP',
    failedToResendOtp: 'Failed to resend OTP',
    failedToUpdatePassword: 'Failed to update password',
    networkError: 'Network error. Please try again.',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordMessage: 'Reset your AZAM TV agent portal password and regain access to your account securely.',
    invalidOtp: 'Invalid OTP',
    checkOtpMessage: 'Please check your OTP and try again',
    seconds: 's'
  },

  // Search functionality
  search: {
    categories: {
      core: 'Core',
      onboarding: 'Onboarding',
      inventory: 'Inventory',
      payments: 'Payments',
      subscribers: 'Subscriber Management',
      adjustment: 'Adjustment',
      serviceTicketing: 'Service Ticketing',
      operations: 'Operations',
      reports: 'Reports'
    },
    pages: {
      agentOnboarding: 'Agent Onboarding',
      customerRegistration: 'Customer Registration',
      stockOverview: 'Stock Overview',
      stockRequest: 'Stock Request',
      stockApproval: 'Stock Approval',
      stockTransfer: 'Stock Transfer',
      serialTracking: 'Serial Tracking',
      casIdChange: 'CAS ID Change',
      stbSmartCardPairing: 'STB Smart Card Pairing',
      warehouseTransfer: 'Warehouse Transfer',
      blockStbAgent: 'Block STB - Agent',
      blockStbCenter: 'Block STB - Center/WH',
      unblockStbAgent: 'Unblock STB - Agent',
      unblockStbCenter: 'Unblock STB - Center/WH',
      poGrnUpdate: 'PO - GRN Update',
      poView: 'PO View',
      customerHardwareReturn: 'Customer Hardware Return',
      agentFaultyRepair: 'Agent Faulty to Repair',
      agentPaymentHardware: 'Agent Payment - Hardware',
      agentPaymentSubscription: 'Agent Payment - Subscription',
      customerPaymentHardware: 'Customer Payment - Hardware',
      customerPaymentSubscription: 'Customer Payment - Subscription',
      receiptCancellation: 'Receipt Cancellation',
      customerTransfer: 'Customer to Customer Transfer',
      searchSubscriber: 'Search Subscriber',
      createAdjustment: 'Create new adjustment',
      adjustment: 'Adjustment',
      newServiceTicketing: 'New Service Ticketing',
      newIncidentManagement: 'New Incident Management',
      bulkProvision: 'Bulk Provision',
      agentCommission: 'Agent Commission',
      provisioning: 'Provisioning',
      reports: 'Reports',
      analyticsDashboard: 'Analytics Dashboard'
    }
  }
};

// Swahili translations
const swahiliTranslations: Translations = {
  // Navigation
  navigation: {
    dashboard: 'Dashibodi',
    agentManagement: 'Usimamizi wa Mawakala',
    searchSubscriber: 'Tafuta Mteja',
    subscriberView: 'Muelekeo wa Mteja',
    subscriptionPurchase: 'Ununuzi wa Usajili',
    subscriptionRenewal: 'Upyaji wa Usajili',
    planChange: 'Badiliko la Mpango',
    addAddonPacks: 'Ongeza Vifurushi vya Ziada',
    customerSuspension: 'Kusimamishwa kwa Mteja',
    customerRegistration: 'Usajili wa Wateja',
    consolidatedSubscriptions: 'Usajili Uliounganishwa',
    logout: 'Ondoka'
  },

  // Navigation main menu
  nav: {
    home: 'Nyumbani',
    onboarding: 'Uongozaji',
    inventory: 'Hazina',
    payments: 'Malipo',
    subscriptions: 'Usajili',
    adjustment: 'Marekebisho',
    serviceTicketing: 'Tiketi za Huduma',
    bulkProvision: 'Uongezaji wa Wingi',
    agentCommission: 'Kodi ya Wakala',
    provisioning: 'Uongezaji',
    dashboard: 'Dashibodi',
    reports: 'Ripoti'
  },

  // Navigation Submenus
  navSubmenus: {
    // Onboarding submenu
    onboarding: {
      agentManagement: 'Usimamizi wa Mawakala',
      agentManagementDesc: 'Simamia uongozaji na wasifu wa mawakala',
      customerManagement: 'Usimamizi wa Wateja',
      customerManagementDesc: 'Sajili wateja wapya na simamia akaunti',
      kycVerification: 'Uthibitisho wa KYC',
      kycVerificationDesc: 'Kagua na kidhi nyaraka za KYC za mawakala'
    },
    
    // Inventory submenu
    inventory: {
      stockOverview: 'Muhtasari wa Hisa',
      stockOverviewDesc: 'Ona viwango vya hisa vya sasa',
      stockRequest: 'Ombi la Hisa',
      stockRequestDesc: 'Omba hazina mpya',
      stockApproval: 'Idhini ya Hisa',
      stockApprovalDesc: 'Idhinisha maombi ya hisa',
      stockTransfer: 'Uhamishaji wa Hisa',
      stockTransferDesc: 'Hamisha kati ya maeneo',
      warehouseTransfer: 'Uhamishaji wa Ghala',
      warehouseTransferDesc: 'Shughuli za ghala',
      trackSerial: 'Fuatilia Nambari za Mfululizo',
      trackSerialDesc: 'Fuatilia nambari za vifaa',
      casIdChange: 'Mabadiliko ya CAS ID',
      casIdChangeDesc: 'Sasisha CAS ID za vifaa',
      stbScPairing: 'Uoanishaji wa STB-SC',
      stbScPairingDesc: 'Oanisha vifaa na kadi',
      blockUnblockAgent: 'Zuia/Fungua Wakala',
      blockUnblockAgentDesc: 'Dhibiti upatikanaji wa wakala',
      blockUnblockCenter: 'Zuia/Fungua Kituo',
      blockUnblockCenterDesc: 'Dhibiti upatikanaji wa kituo',
      purchaseOrders: 'Maagizo ya Ununuzi',
      purchaseOrdersDesc: 'Ona maagizo ya ununuzi',
      grnUpdate: 'Sasisha GRN',
      grnUpdateDesc: 'Sasisha vidokezo vya kupokea',
      agentHardwareSale: 'Mauzo ya Kifaa cha Wakala',
      agentHardwareSaleDesc: 'Rekodi mauzo ya wakala',
      customerHardwareSale: 'Mauzo ya Kifaa cha Mteja',
      customerHardwareSaleDesc: 'Rekodi mauzo ya wateja',
      hardwareReturns: 'Marudisho ya Kifaa',
      hardwareReturnsDesc: 'Shughulikia marudisho',
      agentReplacement: 'Uhamishaji wa Wakala',
      agentReplacementDesc: 'Uhamishaji wa mawakala',
      faultyRepair: 'Ukarabati wa Hitilafu',
      faultyRepairDesc: 'Ripoti hitilafu za vifaa'
    },
    
    // Payment submenu
    payment: {
      agentPaymentHW: 'Malipo ya Wakala - Kifaa',
      agentPaymentHWDesc: 'Usindikaji wa malipo ya kifaa',
      agentPaymentSubscription: 'Malipo ya Wakala - Usajili',
      agentPaymentSubscriptionDesc: 'Usindikaji wa malipo ya usajili',
      customerPaymentHW: 'Malipo ya Mteja - Kifaa',
      customerPaymentHWDesc: 'Malipo ya kifaa cha wateja',
      customerPaymentSubscription: 'Malipo ya Mteja - Usajili',
      customerPaymentSubscriptionDesc: 'Malipo ya usajili wa wateja',
      receiptCancellation: 'Kufuta Risiti',
      receiptCancellationDesc: 'Futa risiti za malipo',
      customerTransfer: 'Uhamishaji Mteja kwa Mteja',
      customerTransferDesc: 'Hamisha kati ya wateja'
    },
    
    // Subscriptions submenu
    subscriptions: {
      searchSubscriber: 'Tafuta Mlanjiwa',
      searchSubscriberDesc: 'Pata usajili wa wateja'
    },
    
    // Adjustment submenu
    adjustment: {
      createAdjustment: 'Tengeneza Marekebisho',
      createAdjustmentDesc: 'Tengeneza marekebisho mapya',
      adjustmentApproval: 'Idhini ya Marekebisho',
      adjustmentApprovalDesc: 'Idhinisha marekebisho yanayosubiri'
    },
    
    // Service Ticketing submenu
    serviceTicketing: {
      serviceTicketing: 'Tiketi za Huduma',
      serviceTicketingDesc: 'Inua tiketi zinazohusiana na huduma',
      newIncident: 'Tukio Jipya',
      newIncidentDesc: 'Tengeneza matukio mapya ya dawati la huduma'
    },
    
    // Bulk Provision submenu
    bulkProvision: {
      newUploadView: 'Upakiaji Mpya na Muonekano',
      newUploadViewDesc: 'Mpya na upakiaji wa faili ya uongezaji wa wingi'
    },
    
    // Agent Commission submenu
    agentCommission: {
      viewCommission: 'Ona Kodi',
      viewCommissionDesc: 'Ona kodi za mawakala'
    },
    
    // Provisioning submenu
    provisioning: {
      provisioning: 'Uongezaji',
      provisioningDesc: 'Usimamizi wa muonekano wa skrini'
    },
    
    // Reports submenu
    reports: {
      dailyReports: 'Ripoti za Kila Siku',
      dailyReportsDesc: 'Ona ripoti za uendeshaji wa kila siku',
      traReports: 'Ripoti za TRA',
      traReportsDesc: 'Ona ripoti za TRA',
      tcraReports: 'Ripoti za TCRA',
      tcraReportsDesc: 'Ona ripoti za TCRA'
    }
  },

  // Common UI elements
  common: {
    search: 'Tafuta',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    delete: 'Futa',
    edit: 'Hariri',
    view: 'Ona',
    add: 'Ongeza',
    update: 'Sasisha',
    submit: 'Wasilisha',
    close: 'Funga',
    loading: 'Inapakia...',
    noData: 'Hakuna data',
    error: 'Hitilafu',
    success: 'Mafanikio',
    warning: 'Onyo',
    info: 'Taarifa',
    confirm: 'Thibitisha',
    yes: 'Ndio',
    no: 'Hapana',
    back: 'Nyuma',
    next: 'Ifuatayo',
    previous: 'Iliyotangulia',
    filter: 'Chuja',
    export: 'Hamisha',
    clear: 'Safisha',
    refresh: 'Onyesha upya',
    showAll: 'Onyesha Zote',
    profile: 'Wasifu',
    settings: 'Mipangilio',
    searchHistory: 'Historia ya Utafutaji',
    popularSearches: 'Utafutaji Maarufu'
  },

  // Dashboard
  dashboard: {
    title: 'Uwanja wa AZAM TV',
    subtitle: 'Mfumo mkuu wa usimamizi kwa mawakala wa uwandani',
    quickActions: 'Vitendo vya Haraka',
    recentActivity: 'Shughuli za Hivi Karibuni',
    statistics: 'Takwimu',
    totalSubscribers: 'Jumla ya Walanjiwa',
    activeSubscribers: 'Walanjiwa Hai',
    totalAgents: 'Jumla ya Mawakala',
    monthlyRevenue: 'Mapato ya Kila Mwezi',
    systemHealth: 'Afya ya Mfumo',
    networkStatus: 'Hali ya Mtandao',
    coverage: 'Ufikaji',
    excellent: 'Bora',
    lastUpdated: 'Imesasishwa Mwisho',
    refreshData: 'Sasisha Data',
    revenueSubscriptionTrends: 'Mielekeo ya Mapato na Usajili',
    months: 'Miezi',
    revenue: 'Mapato',
    newSubscriptions: 'Usajili Mpya',
    regionalPerformance: 'Utendaji wa Mikoa',
    subscribers: 'walanjiwa',
    dailyActivityOverview: 'Muhtasari wa Shughuli za Kila Siku',
    newSubs: 'Usajili Mpya',
    payments: 'Malipo',
    support: 'Msaada',
    packageDistribution: 'Usambazaji wa Vifurushi',
    recentActivities: 'Shughuli za Hivi Karibuni',
    viewAll: 'Ona Zote',
    newCustomer: 'Mteja Mpya',
    registerSubscriber: 'Sajili mteja',
    processPayment: 'Shughulikia Malipo',
    handlePayment: 'Shughulikia malipo',
    viewReports: 'Ona Ripoti',
    analyticsInsights: 'Uchambuzi na maarifa',
    manageInventory: 'Simamia Hazina',
    stockControl: 'Udhibiti wa hisa',
    systemMonitor: 'Kufuatilia Mfumo',
    healthStatus: 'Hali ya afya',
    customerSupport: 'Msaada wa Wateja',
    helpTickets: 'Msaada na tiketi',
    azamPremium: 'Azam Premium',
    azamPlus: 'Azam Plus',
    azamLite: 'Azam Lite',
    azamUltra: 'Azam Ultra',
    newPremiumSubscription: 'Usajili mpya wa Premium',
    paymentReceived: 'Malipo yamepokewa',
    hardwareDeliveryCompleted: 'Uwasilishaji wa vifaa umekamilika',
    autoRenewalProcessed: 'Upyaji otomatiki umeshughulikiwa',
    planChange: 'Mabadiliko ya mpango',
    liteToPlus: 'Lite hadi Plus',
    system: 'Mfumo',
    agent: 'Wakala',
    customers: 'wateja',
    minAgo: 'dakika zilizopita',
    darEsSalaam: 'Dar es Salaam',
    arusha: 'Arusha',
    mwanza: 'Mwanza',
    dodoma: 'Dodoma',
    mbeya: 'Mbeya',
    morogoro: 'Morogoro'
  },

  // Search Subscriber
  searchSubscriber: {
    title: 'Tafuta Mteja',
    subtitle: 'Tafuta na uone taarifa za mteja moja kwa moja',
    searchTerm: 'Neno la Utafutaji',
    searchType: 'Aina ya Utafutaji',
    allFields: 'Sehemu Zote',
    customerName: 'Jina la Mteja',
    phoneNumber: 'Nambari ya Simu',
    emailAddress: 'Anwani ya Barua Pepe',
    smartCardNumber: 'Nambari ya Kadi Mahiri',
    sapBpId: 'Kitambulisho cha SAP BP',
    findAndView: 'Tafuta na Uone Mteja',
    searchTips: 'Vidokezo vya Utafutaji',
    searchTipsText: 'Tumia sehemu za majina, ingiza nambari kamili za simu/kadi mahiri. Utafutaji utakupeleka moja kwa moja kwenye wasifu wa mteja.',
    noSubscriberFound: 'Hakuna mteja aliyepatikana kulingana na vigezo vyako vya utafutaji. Jaribu kutumia maneno mengine ya utafutaji.',
    enterSearchTerm: 'Tafadhali ingiza neno la utafutaji',
    placeholder: 'Ingiza jina, simu, barua pepe, nambari ya kadi mahiri, au kitambulisho cha SAP BP...'
  },

  // Subscriber View
  subscriberView: {
    title: 'Wasifu wa Mteja',
    overview: 'Maelezo',
    subscriptions: 'Usajili',
    hardware: 'Vifaa',
    history: 'Historia',
    billing: 'Malipo',
    customerInfo: 'Taarifa za Mteja',
    accountDetails: 'Maelezo ya Akaunti',
    subscriptionInfo: 'Taarifa za Usajili',
    currentPlan: 'Mpango wa Sasa',
    status: 'Hali',
    endDate: 'Tarehe ya Mwisho',
    walletBalance: 'Mizani ya Mkoba',
    viewDetails: 'Ona Maelezo',
    active: 'Hai',
    suspended: 'Kusimamishwa',
    disconnected: 'Kukatwa',
    terminated: 'Kukomesha'
  },

  // Agent Management
  agentManagement: {
    title: 'Usimamizi wa Mawakala',
    subtitle: 'Simamia mawakala wa uwandani na utendaji wao',
    addAgent: 'Ongeza Wakala Mpya',
    agentList: 'Orodha ya Mawakala',
    agentName: 'Jina la Wakala',
    email: 'Barua Pepe',
    phone: 'Simu',
    region: 'Mkoa',
    performance: 'Utendaji',
    actions: 'Vitendo'
  },

  // Customer Registration
  customerRegistration: {
    title: 'Usajili wa Wateja',
    subtitle: 'Sajili wateja wapya',
    personalInfo: 'Taarifa za Kibinafsi',
    firstName: 'Jina la Kwanza',
    lastName: 'Jina la Mwisho',
    email: 'Anwani ya Barua Pepe',
    phone: 'Nambari ya Simu',
    address: 'Anwani',
    city: 'Jiji',
    region: 'Mkoa',
    customerType: 'Aina ya Mteja',
    prepaid: 'Kulipa Awali',
    postpaid: 'Kulipa Baadaye',
    registerCustomer: 'Sajili Mteja'
  },

  // Subscription Management
  subscription: {
    purchase: 'Nunua Usajili',
    renewal: 'Pya Usajili',
    planChange: 'Badilisha Mpango',
    addAddon: 'Ongeza Kifurushi cha Ziada',
    suspension: 'Simamisha Mteja',
    planName: 'Jina la Mpango',
    amount: 'Kiasi',
    duration: 'Muda',
    features: 'Vipengele',
    selectPlan: 'Chagua Mpango',
    paymentMethod: 'Njia ya Malipo',
    wallet: 'Mkoba',
    mobileMoney: 'Pesa za Simu',
    bankTransfer: 'Uhamishaji wa Benki'
  },

  // Statistics
  stats: {
    total: 'Jumla',
    active: 'Hai',
    suspended: 'Kusimamishwa',
    disconnected: 'Kukatwa',
    subscribers: 'Walanjiwa',
    agents: 'Mawakala',
    revenue: 'Mapato',
    thisMonth: 'Mwezi Huu',
    lastMonth: 'Mwezi Uliopita',
    growth: 'Ukuaji'
  },

  // Time and dates
  time: {
    today: 'Leo',
    yesterday: 'Jana',
    lastWeek: 'Wiki Iliyopita',
    lastMonth: 'Mwezi Uliopita',
    thisYear: 'Mwaka Huu',
    minutes: 'dakika',
    hours: 'masaa',
    days: 'siku',
    weeks: 'wiki',
    months: 'miezi',
    years: 'miaka',
    ago: 'zilizopita'
  },



  // Home page
  home: {
    title: 'Uwanja wa AZAM TV',
    subtitle: 'Chagua moduli ya huduma ili kuanza',
    welcomeMessage: 'Karibu kwenye Mfumo wa Usimamizi wa Mawakala wa AZAM TV',
    modules: 'Moduli za Huduma',
    getStarted: 'Anza',
    quickActions: 'Vitendo vya Haraka',
    coreModules: 'Moduli Kuu',
    analyticsModules: 'Uchambuzi na Ripoti',
    operationsModules: 'Uendeshaji',
    agentManagement: 'Usimamizi wa Mawakala',
    agentManagementDesc: 'Simamia mawakala wa uwandani na utendaji wao',
    customerManagement: 'Usimamizi wa Wateja',
    customerManagementDesc: 'Dhibiti akaunti za wateja na taarifa za usajili',
    kycVerification: 'Uthibitisho wa KYC',
    kycVerificationDesc: 'Kagua na uidhinishe nyaraka za utambulisho wa mawakala',
    inventoryManagement: 'Usimamizi wa Hesabu ya Mali',
    inventoryManagementDesc: 'Fuatilia na simamia vifaa vyote vya AZAM TV',
    paymentProcessing: 'Usindikaji wa Malipo',
    paymentProcessingDesc: 'Simamia malipo ya wateja na mawakala',
    subscriptionManagement: 'Usimamizi wa Usajili',
    subscriptionManagementDesc: 'Dhibiti mipango ya usajili na vipengele vya ziada',
    serviceTicketing: 'Tiketi za Huduma',
    serviceTicketingDesc: 'Ongoza masuala ya huduma na matatizo ya wateja',
    bulkProvision: 'Utayarishaji wa Wingi',
    bulkProvisionDesc: 'Tayarisha wateja wengi kwa wakati mmoja',
    agentCommission: 'Ushuru wa Mawakala',
    agentCommissionDesc: 'Ona na simamia malipo ya ushuru kwa mawakala',
    provisioning: 'Utayarishaji',
    provisioningDesc: 'Simamia mipangilio ya onyesho la skrini na vitu vingine',
    reports: 'Ripoti',
    reportsDesc: 'Tengeneza ripoti za uchambuzi na takwimu',
    searchSubscriber: 'Tafuta Mteja',
    searchSubscriberDesc: 'Tafuta na uone taarifa za mteja haraka',
    subscriberView: 'Muelekeo wa Mteja',
    subscriberViewDesc: 'Ona wasifu kamili wa mteja na historia yake',
    subscriptionPurchase: 'Ununuzi wa Usajili',
    subscriptionPurchaseDesc: 'Sajili usajili mpya kwa wateja',
    subscriptionRenewal: 'Upyaji wa Usajili',
    subscriptionRenewalDesc: 'Pya mipango ya usajili iliyoisha',
    planChange: 'Badiliko la Mpango',
    planChangeDesc: 'Badilisha mipango ya usajili ya wateja',
    addAddonPacks: 'Ongeza Vifurushi vya Ziada',
    addAddonPacksDesc: 'Ongeza vipengele vya ziada kwenye usajili',
    customerSuspension: 'Kusimamishwa kwa Wateja',
    customerSuspensionDesc: 'Simamisha mipango ya usajili ya wateja kwa muda',
    customerRegistration: 'Usajili wa Wateja',
    customerRegistrationDesc: 'Sajili wateja wapya kwenye mfumo',
    consolidatedSubscriptions: 'Usajili Uliounganishwa',
    consolidatedSubscriptionsDesc: 'Ona usajili wa wateja uliounganishwa',
    planValidityExtension: 'Kuongezewa Uhalali wa Mpango',
    planValidityExtensionDesc: 'Ongeza muda wa uhalali wa mipango ya wateja',
    disconnection: 'Kukatwa kwa Huduma',
    disconnectionDesc: 'Kata huduma za wateja kwa sababu za malipo',
    reconnection: 'Kuunganishwa Upya',
    reconnectionDesc: 'Unganisha upya huduma za wateja',
    offerChange: 'Badiliko la Ofa',
    offerChangeDesc: 'Badilisha ofa za wateja',
    termination: 'Kukomesha',
    terminationDesc: 'Komesha kabisa akaunti za wateja',
    retrack: 'Kufuatilia Upya',
    retrackDesc: 'Fuatilia upya viunganisho vya huduma',
    replacement: 'Mbadala',
    replacementDesc: 'Badilisha vifaa na huduma',
    paymentTransactions: 'Miamala ya Malipo',
    paymentTransactionsDesc: 'Ona na simamia rekodi za malipo',
    serviceTransactions: 'Miamala ya Huduma',
    serviceTransactionsDesc: 'Fuatilia historia ya miamala ya huduma'
  },

  // Subscription Modules
  subscriptionModule: {
    title: 'Usimamizi wa Usajili',
    subtitle: 'Moduli 19 Zinapatikana',
    searchSubscriber: 'Tafuta Mteja',
    searchSubscriberDesc: 'Tafuta maelezo ya usajili ya mteja',
    subscriberView: 'Muelekeo wa Mteja',
    subscriberViewDesc: 'Ona wasifu kamili wa mteja',
    subscriberManagement: 'Usimamizi wa Walanjiwa',
    subscriptionOperations: 'Uendeshaji wa Usajili',
    serviceManagement: 'Usimamizi wa Huduma',
    transactionManagement: 'Usimamizi wa Miamala',
    billingInvoicing: 'Malipo na Bili',
    quickActions: 'Vitendo vya Haraka'
  },

  // Inventory
  inventory: {
    title: 'Usimamizi wa Hesabu ya Mali',
    subtitle: 'Simamia hesabu ya vifaa na ufuatiliaji',
    stockOverview: 'Muhtasari wa Hisa',
    stockRequest: 'Ombi la Hisa',
    stockApproval: 'Idhini ya Hisa',
    stockTransfer: 'Uhamishaji wa Hisa',
    trackSerial: 'Fuatilia Nambari za Mlolongo',
    casIdChange: 'Badiliko la Kitambulisho cha CAS',
    stbScPairing: 'Uunganishaji wa STB-SC',
    warehouseTransfer: 'Uhamishaji wa Ghala',
    blockUnblockAgent: 'Zuia/Fungua Wakala',
    blockUnblockCenter: 'Zuia/Fungua Kituo',
    pogrnUpdate: 'Sasisha PO/GRN',
    poView: 'Ona Agizo la Ununuzi',
    customerHardwareReturn: 'Kurejeshwa kwa Vifaa vya Mteja',
    agentReplacement: 'Mbadala wa Wakala',
    agentFaultyRepair: 'Ukarabati wa Hitilafu za Wakala',
    agentPaymentHW: 'Malipo ya Vifaa ya Wakala',
    agentHardwareSale: 'Uuzaji wa Vifaa vya Wakala',
    customerHardwareSale: 'Uuzaji wa Vifaa vya Wateja',
    customerPaymentHW: 'Malipo ya Vifaa vya Wateja'
  },

  // Hardware and technical
  hardware: {
    stbModel: 'Mfano wa STB',
    stbSerial: 'Nambari ya Mlolongo wa STB',
    smartCard: 'Kadi Mahiri',
    smartCardNumber: 'Nambari ya Kadi Mahiri',
    warrantyStatus: 'Hali ya Dhamana',
    condition: 'Hali',
    working: 'Inafanya Kazi',
    faulty: 'Imeharibika',
    damaged: 'Imeharibiwa',
    purchaseDate: 'Tarehe ya Ununuzi',
    warrantyEnd: 'Mwisho wa Dhamana'
  },

  // Login and authentication
  auth: {
    login: 'Ingia',
    logout: 'Toka',
    username: 'Jina la Mtumiaji',
    password: 'Nenosiri',
    forgotPassword: 'Umesahau Nenosiri',
    signIn: 'Ingia',
    signOut: 'Toka',
    rememberMe: 'Nikumbuke',
    invalidCredentials: 'Jina la mtumiaji au nenosiri si sahihi',
    sessionExpired: 'Kipindi chako kimemalizika',
    welcomeBack: 'Karibu Tena',
    pleaseSignIn: 'Tafadhali ingia ili kuendelea',
    welcomeMessage: 'Pata ufikiaji wa uwanja wako wa usimamizi wa wakala wa AZAM TV na uratibishe shughuli zako kwa kutumia jukwaa letu la akili.',
    secureReliableProfessional: 'Salama • Inayotegemewa • Kitaalam',
    emailAddress: 'Anwani ya Barua Pepe',
    enterCredentials: 'Ingiza taarifa zako za kuingia ili kuendelea',
    emailPlaceholder: 'barua.pepe@kampuni.com',
    passwordPlaceholder: 'Ingiza nenosiri lako',
    forgotPasswordQuestion: 'Umesahau nenosiri lako?',
    signingIn: 'Ninaingia...',
    signInToDashboard: 'Ingia kwenye Dashibodi',
    needAssistance: 'Unahitaji msaada?',
    contactSupport: 'Wasiliana na Msaada',
    loginFailed: 'Kuingia Kumeshindwa',
    invalidEmailPassword: 'Barua pepe au nenosiri si sahihi',
    resetPassword: 'Weka Upya Nenosiri',
    resetPasswordMessage: 'Ingiza anwani ya barua pepe yako na tutakutumia msimbo wa uthibitisho',
    enterEmailAddress: 'Ingiza anwani ya barua pepe yako',
    sendVerificationCode: 'Tuma Msimbo wa Uthibitisho',
    sending: 'Ninatuma...',
    verifyCode: 'Thibitisha Msimbo',
    verifyCodeMessage: 'Ingiza msimbo wa tarakimu 6 uliotumwa',
    verifying: 'Ninathitibisha...',
    didntReceiveCode: 'Hukupokea msimbo?',
    resendCode: 'Tuma Tena Msimbo',
    resendInSeconds: 'Tuma tena baada ya',
    resending: 'Ninatuma tena...',
    newPassword: 'Nenosiri Jipya',
    newPasswordMessage: 'Chagua nenosiri lenye nguvu kwa akaunti yako',
    confirmPassword: 'Thibitisha Nenosiri',
    enterNewPassword: 'Ingiza nenosiri jipya',
    confirmNewPassword: 'Thibitisha nenosiri jipya',
    updating: 'Ninasasisha...',
    updatePassword: 'Sasisha Nenosiri',
    backToLogin: 'Rudi kwenye Kuingia',
    otpSent: 'OTP Imetumwa',
    otpSentMessage: 'Tafadhali angalia barua pepe yako kwa msimbo wa uthibitisho',
    otpVerified: 'OTP Imethibitishwa',
    otpVerifiedMessage: 'Tafadhali ingiza nenosiri lako jipya',
    passwordUpdated: 'Nenosiri Limesasishwa',
    passwordUpdatedMessage: 'Nenosiri lako limesasishwa kwa mafanikio',
    passwordsDoNotMatch: 'Nenosiri hazilingani',
    passwordTooShort: 'Nenosiri Ni Fupi Sana',
    passwordMinLength: 'Nenosiri lazima liwe na herufi angalau 6',
    otpResent: 'OTP Imetumwa Tena',
    otpResentMessage: 'Msimbo mpya wa uthibitisho umetumwa kwenye barua pepe yako',
    failedToSendOtp: 'Kushindwa kutuma OTP',
    failedToResendOtp: 'Kushindwa kutuma tena OTP',
    failedToUpdatePassword: 'Kushindwa kusasisha nenosiri',
    networkError: 'Hitilafu ya mtandao. Tafadhali jaribu tena.',
    forgotPasswordTitle: 'Umesahau Nenosiri',
    forgotPasswordMessage: 'Weka upya nenosiri lako la uwanja wa wakala wa AZAM TV na upate ufikiaji wa akaunti yako kwa usalama.',
    invalidOtp: 'OTP si sahihi',
    checkOtpMessage: 'Tafadhali angalia OTP yako na ujaribu tena',
    seconds: 's'
  },

  // Search functionality
  search: {
    categories: {
      core: 'Msingi',
      onboarding: 'Uongozaji',
      inventory: 'Hesabu ya Mali',
      payments: 'Malipo',
      subscribers: 'Usimamizi wa Walanjiwa',
      adjustment: 'Urekebishaji',
      serviceTicketing: 'Kutoa Tiketi za Huduma',
      operations: 'Shughuli',
      reports: 'Ripoti'
    },
    pages: {
      agentOnboarding: 'Uongozaji wa Wakala',
      customerRegistration: 'Usajili wa Wateja',
      stockOverview: 'Muhtasari wa Hisa',
      stockRequest: 'Ombi la Hisa',
      stockApproval: 'Idhini ya Hisa',
      stockTransfer: 'Uhamishaji wa Hisa',
      serialTracking: 'Ufuatiliaji wa Nambari za Mlolongo',
      casIdChange: 'Badiliko la Kitambulisho cha CAS',
      stbSmartCardPairing: 'Uunganishaji wa STB na Kadi Mahiri',
      warehouseTransfer: 'Uhamishaji wa Ghala',
      blockStbAgent: 'Zuia STB - Wakala',
      blockStbCenter: 'Zuia STB - Kituo/Ghala',
      unblockStbAgent: 'Fungua STB - Wakala',
      unblockStbCenter: 'Fungua STB - Kituo/Ghala',
      poGrnUpdate: 'Sasisha PO - GRN',
      poView: 'Ona Agizo la Ununuzi',
      customerHardwareReturn: 'Kurejeshwa kwa Vifaa vya Mteja',
      agentFaultyRepair: 'Ukarabati wa Hitilafu za Wakala',
      agentPaymentHardware: 'Malipo ya Vifaa ya Wakala',
      agentPaymentSubscription: 'Malipo ya Usajili wa Wakala',
      customerPaymentHardware: 'Malipo ya Vifaa vya Mteja',
      customerPaymentSubscription: 'Malipo ya Usajili wa Mteja',
      receiptCancellation: 'Kufutwa kwa Stakabadhi',
      customerTransfer: 'Uhamisho wa Mteja kwa Mteja',
      searchSubscriber: 'Tafuta Mteja',
      createAdjustment: 'Unda urekebishaji mpya',
      adjustment: 'Urekebishaji',
      newServiceTicketing: 'Tiketi Mpya za Huduma',
      newIncidentManagement: 'Usimamizi Mpya wa Matukio',
      bulkProvision: 'Utoaji wa Huduma kwa Wingi',
      agentCommission: 'Kamisheni za Wakala',
      provisioning: 'Utoaji wa Huduma',
      reports: 'Ripoti',
      analyticsDashboard: 'Dashibodi ya Uchanganuzi'
    }
  }
};

// All translations
const translations: Record<Language, Translations> = {
  en: englishTranslations,
  sw: swahiliTranslations
};

// Language context
class LanguageService {
  private currentLanguage: Language = 'en';
  private listeners: ((language: Language) => void)[] = [];

  constructor() {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('azam-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
      this.currentLanguage = savedLanguage;
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('azam-language', language);
    this.listeners.forEach(listener => listener(language));
  }

  subscribe(listener: (language: Language) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  translate(key: string, language?: Language): string {
    const lang = language || this.currentLanguage;
    const langTranslations = translations[lang];
    
    const keys = key.split('.');
    let value: any = langTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        const englishTranslations = translations.en;
        let englishValue: any = englishTranslations;
        for (const ek of keys) {
          if (englishValue && typeof englishValue === 'object' && ek in englishValue) {
            englishValue = englishValue[ek];
          } else {
            return key; // Return key if no translation found
          }
        }
        return typeof englishValue === 'string' ? englishValue : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }
}

// Export singleton instance
export const languageService = new LanguageService();

// React hook for using translations
export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languageService.getCurrentLanguage());

  useEffect(() => {
    return languageService.subscribe(setCurrentLanguage);
  }, []);

  const t = (key: string): string => {
    return languageService.translate(key);
  };

  const changeLanguage = (language: Language): void => {
    languageService.setLanguage(language);
  };

  return {
    t,
    currentLanguage,
    changeLanguage
  };
}

// Helper function for getting translation without hook
export const t = (key: string, language?: Language): string => {
  return languageService.translate(key, language);
};