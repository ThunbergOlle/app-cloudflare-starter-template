import { Hono } from "hono";
import Handlebars from "handlebars";
import {
  Env,
  HelloWorldData,
  LandingPageData,
  PrivacyPolicyData,
  SupportData,
  PasswordResetData,
  DeleteAccountData,
} from "./types";
import { PageRenderer } from "./renderer";
import HelloWorld from "./generated/HelloWorld";
import LandingPage from "./generated/LandingPage";
import PrivacyPolicy from "./generated/PrivacyPolicy";
import Support from "./generated/Support";
import PasswordReset from "./generated/PasswordReset";
import DeleteAccount from "./generated/DeleteAccount";
import { createApiClient } from "./trpc-client";
import {
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
  generateFAQPageSchema,
} from "./utils/schema";

const app = new Hono<Env>();

let clickCount = 0;

app.get("/", (c) => {
  const render = Handlebars.template(LandingPage);

  // Generate structured data for landing page
  const softwareSchema = generateSoftwareApplicationSchema({
    name: "Example",
    description: "Example description",
    applicationCategory: "TravelApplication",
    operatingSystem: "iOS, Android",
    offers: {
      price: "0",
      priceCurrency: "USD",
    },
  });

  const orgSchema = generateOrganizationSchema({
    name: "Example Organization",
    url: "<example-url>",
    email: "<example-email>",
    address: {
      addressCountry: "SE",
    },
  });

  const faqSchema = generateFAQPageSchema();

  // Combine all schemas into a single array
  const structuredData = `[${softwareSchema},${orgSchema},${faqSchema}]`;

  const data: LandingPageData = {
    title: "Example title",
    description: "Example description",
  };

  return PageRenderer(
    c,
    render(data),
    data.title,
    data.description,
    "<example-url>",
    structuredData,
  );
});

app.get("/privacy-policy", (c) => {
  const render = Handlebars.template(PrivacyPolicy);
  const data: PrivacyPolicyData = {
    title: "Privacy Policy - Example",
    lang: "en",
    lastUpdated: "Last updated: September 28, 2025",
    introduction:
      'Example ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, web services, and related services.',
    gdprNotice:
      "As a service operating within the European Union, we comply with the General Data Protection Regulation (GDPR). This policy outlines your rights and our obligations regarding your personal data.",
    personalInfo: [
      "Email address (for account creation and authentication)",
      "Name (optional, for personalization)",
      "Language preferences and account settings",
      "Account credentials (securely hashed and salted)",
    ],
    locationDataDescription:
      "We collect your location data when you use our monument identification features. This includes:",
    locationData: [
      "Precise location coordinates to identify nearby monuments",
      "Location history associated with your monument scans",
      "Geographic region information for content localization",
    ],
    cameraDescription: "When you use our camera feature:",
    cameraData: [
      "Photos are captured and processed for monument identification",
      "Images are securely stored on Cloudflare R2 to improve platform accuracy",
      "Image data is shared with OpenAI for AI-powered monument identification services",
      "Photos include metadata such as upload timestamp and user association",
      "We do not share images with tracking agencies or unauthorized third parties",
    ],
    deviceInfo: [
      "Device type and operating system information",
      "App version and usage analytics",
      "Crash reports and performance data collected via Sentry for service improvement",
      "Error logs and debugging information to improve app stability",
      "Application usage patterns and feature interactions",
      "Server logs and API request data sent to Papertrail logging service for monitoring",
    ],
    audioData: [
      "Microphone access permissions for potential future audio features",
      "Audio recording capabilities (currently not actively used)",
      "Voice interaction data if audio features are enabled",
    ],
    notificationData: [
      "Push notification tokens for sending location-based alerts",
      "Notification preferences and settings",
      "Delivery status and interaction data with sent notifications",
    ],
    legalBasisIntro:
      "Under GDPR, we process your personal data based on the following lawful bases:",
    legalBases: [
      {
        name: "Contract",
        description:
          "Processing necessary for the performance of our service agreement with you",
      },
      {
        name: "Consent",
        description:
          "For optional features like location tracking and analytics, where you have provided explicit consent",
      },
      {
        name: "Legitimate Interest",
        description: "For service improvement, security, and fraud prevention",
      },
      {
        name: "Legal Obligation",
        description:
          "When required to comply with applicable laws and regulations",
      },
    ],
    dataUsage: [
      "Provide and maintain our monument identification services",
      "Identify monuments and provide relevant historical information",
      "Improve our app functionality and user experience",
      "Send important updates about our services",
      "Respond to your support requests and communications",
      "Ensure security and prevent fraud or abuse",
    ],
    dataSharingIntro:
      "We do not sell, trade, or rent your personal information to third parties. We may share your information with the following service providers:",
    dataSharing: [
      {
        service: "OpenAI",
        purpose: "AI-powered monument identification and image processing",
        location: "United States",
      },
      {
        service: "Google Services",
        purpose: "Authentication, nearby places API, and map services",
        location: "United States",
      },
      {
        service: "Apple Sign-In",
        purpose: "Authentication services",
        location: "United States",
      },
      {
        service: "Cloudflare",
        purpose: "Secure image storage, web hosting, and infrastructure",
        location: "EU/Global",
      },
      {
        service: "Sentry",
        purpose: "Error tracking, crash reporting, and performance monitoring",
        location: "Germany/EU",
      },
      {
        service: "Papertrail (SolarWinds)",
        purpose: "Server logging, monitoring, and debugging",
        location: "United States",
      },
      {
        service: "Wikipedia APIs",
        purpose: "Monument information and nearby places data",
        location: "Global",
      },
    ],
    rightsIntro:
      "Under GDPR, you have the following rights regarding your personal data:",
    gdprRights: [
      {
        right: "Right of Access",
        description: "Request a copy of your personal data we hold",
      },
      {
        right: "Right to Rectification",
        description: "Correct inaccurate or incomplete personal data",
      },
      {
        right: "Right to Erasure",
        description: "Request deletion of your personal data and account",
      },
      {
        right: "Right to Restrict Processing",
        description: "Limit how we process your personal data",
      },
      {
        right: "Right to Data Portability",
        description: "Receive your data in a machine-readable format",
      },
      {
        right: "Right to Object",
        description: "Object to processing based on legitimate interests",
      },
      {
        right: "Right to Withdraw Consent",
        description: "Withdraw consent for processing that requires it",
      },
    ],
    securityDescription:
      "We implement comprehensive security measures to protect your information:",
    securityMeasures: [
      "End-to-end encrypted data transmission using HTTPS/TLS",
      "Secure server infrastructure hosted on Cloudflare Workers",
      "Password hashing and salting for account security",
      "Regular security audits and monitoring",
      "Limited access to personal information on a need-to-know basis",
      "Secure image storage with access controls",
    ],
    dataRetentionPolicy:
      "We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Specific retention periods: Account data is retained while your account is active and for 30 days after account deletion. Monument scan images are retained for 2 years for service improvement unless deletion is specifically requested. Location data associated with scans is retained for 1 year. Crash reports and error logs are retained for 90 days. You may request deletion of your account and associated data at any time, and we will process such requests within 30 days.",
    childrensPrivacy:
      "Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately and we will take steps to remove it.",
    policyChanges:
      'We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last updated" date. For significant changes, we will provide additional notice through our app or email.',
    contactIntro:
      "If you have questions about this Privacy Policy, wish to exercise your rights, or have privacy concerns, please contact us:",
    contactEmail: "privacy@aperto.app",
    address: "Sweden (EU)",
  };

  return PageRenderer(
    c,
    render(data),
    data.title,
    undefined,
    "https://aperto-app.com/privacy-policy",
  );
});

app.get("/support", (c) => {
  const render = Handlebars.template(Support);
  const data: SupportData = {
    title: "Support - Example",
    description:
      "Get help with Example - Contact our support team for assistance with any questions or issues",
  };

  return PageRenderer(
    c,
    render(data),
    data.title,
    data.description,
    "https://aperto-app.com/support",
  );
});

app.post("/api/increment", (c) => {
  clickCount++;
  return c.text(clickCount.toString());
});

app.get("/api/count", (c) => {
  return c.json({ count: clickCount });
});

// Password reset page
app.get("/user/password-reset", (c) => {
  const token = c.req.query("token");

  if (!token) {
    const render = Handlebars.template(PasswordReset);
    const data: PasswordResetData = {
      title: "Password Reset - Example",
      token: "",
      error: "Missing reset token. Please use the link from your email.",
    };
    return PageRenderer(
      c,
      render(data),
      data.title,
      "Reset your Example account password",
      "https://example.com/user/password-reset",
    );
  }

  const render = Handlebars.template(PasswordReset);
  const data: PasswordResetData = {
    title: "Password Reset - Example",
    token: token,
  };

  return PageRenderer(
    c,
    render(data),
    data.title,
    "Reset your Example account password",
    "https://aperto-app.com/user/password-reset",
  );
});

// Password reset API endpoint - proxies to backend via service binding
app.post("/api/password-reset", async (c) => {
  try {
    const formData = await c.req.formData();
    const token = formData.get("token") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!token || !newPassword) {
      const render = Handlebars.template(PasswordReset);
      const data: PasswordResetData = {
        title: "Password Reset - Example",
        token: token || "",
        error: "Please provide all required fields",
      };
      return c.html(render(data));
    }

    // Create tRPC client and call resetPassword mutation
    const trpcClient = createApiClient(c.env.API_SERVICE);
    const result = await trpcClient.resetPassword.mutate({
      token,
      newPassword,
    });

    // Check if the response indicates success
    if (result.success) {
      const render = Handlebars.template(PasswordReset);
      const data: PasswordResetData = {
        title: "Password Reset - Example",
        token: "",
        success: true,
      };
      return c.html(render(data));
    } else {
      const render = Handlebars.template(PasswordReset);
      const data: PasswordResetData = {
        title: "Password Reset - Example",
        token: token,
        error: "Failed to reset password",
      };
      return c.html(render(data));
    }
  } catch (error) {
    // Extract error message from tRPC error
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";

    const render = Handlebars.template(PasswordReset);
    const data: PasswordResetData = {
      title: "Password Reset - Example",
      token: token,
      error: errorMessage,
    };
    return c.html(render(data));
  }
});

// Delete account page
app.get("/user/delete-account", (c) => {
  const render = Handlebars.template(DeleteAccount);
  const data: DeleteAccountData = {
    title: "Delete Account - Example",
  };

  return PageRenderer(
    c,
    render(data),
    data.title,
    "Delete your Example account and all associated data",
    "https://example.com/user/delete-account",
  );
});

// Delete account API endpoint - proxies to backend via service binding
app.post("/api/delete-account", async (c) => {
  let email = "";

  try {
    const formData = await c.req.formData();
    email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmation = formData.get("confirmation") === "on";

    if (!email || !password || !confirmation) {
      const render = Handlebars.template(DeleteAccount);
      const data: DeleteAccountData = {
        title: "Delete Account - Example",
        email: email || "",
        error: "Please provide all required fields and confirm deletion",
      };
      return c.html(render(data));
    }

    // Create tRPC client and call deleteAccountViaWeb mutation
    const trpcClient = createApiClient(c.env.API_SERVICE);
    const result = await trpcClient.deleteAccountViaWeb.mutate({
      email,
      password,
      confirmation,
    });

    // Check if the response indicates success
    if (result.success) {
      const render = Handlebars.template(DeleteAccount);
      const data: DeleteAccountData = {
        title: "Delete Account - Example",
        success: true,
      };
      return c.html(render(data));
    } else {
      const render = Handlebars.template(DeleteAccount);
      const data: DeleteAccountData = {
        title: "Delete Account - Example",
        email: email,
        error: "Failed to delete account",
      };
      return c.html(render(data));
    }
  } catch (error) {
    console.error("Account deletion error:", error);

    // Extract error message from tRPC error
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";

    const render = Handlebars.template(DeleteAccount);
    const data: DeleteAccountData = {
      title: "Delete Account - Example",
      email: email || "",
      error: errorMessage,
    };
    return c.html(render(data));
  }
});

// Handle static assets
app.get("/*", async (c) => {
  try {
    return await c.env.ASSETS.fetch(c.req.raw);
  } catch {
    return c.notFound();
  }
});

export default app;
