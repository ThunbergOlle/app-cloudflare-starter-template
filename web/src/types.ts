export interface Env {
  Bindings: {
    ASSETS: Fetcher;
    API_SERVICE: Fetcher;
  };
}

export interface HelloWorldData {
  message: string;
  count: number;
}

export interface LandingPageData {
  title: string;
  description: string;
  structuredData?: string;
}

export interface PrivacyPolicyData {
  title: string;
  lang: string;
  lastUpdated: string;
  introduction: string;
  gdprNotice: string;
  personalInfo: string[];
  locationDataDescription: string;
  locationData: string[];
  cameraDescription: string;
  cameraData: string[];
  deviceInfo: string[];
  legalBasisIntro: string;
  legalBases: Array<{
    name: string;
    description: string;
  }>;
  dataUsage: string[];
  dataSharingIntro: string;
  dataSharing: Array<{
    service: string;
    purpose: string;
    location?: string;
  }>;
  rightsIntro: string;
  gdprRights: Array<{
    right: string;
    description: string;
  }>;
  securityDescription: string;
  securityMeasures: string[];
  dataRetentionPolicy: string;
  childrensPrivacy: string;
  policyChanges: string;
  contactIntro: string;
  contactEmail: string;
  address: string;
}

export interface SupportData {
  title: string;
  description: string;
}

export interface PasswordResetData {
  title: string;
  token: string;
  error?: string;
  success?: boolean;
}

export interface DeleteAccountData {
  title: string;
  email?: string;
  error?: string;
  success?: boolean;
}

