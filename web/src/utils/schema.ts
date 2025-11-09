/**
 * Schema.org structured data utilities for SEO
 */

export interface SoftwareApplicationSchema {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

export interface OrganizationSchema {
  name: string;
  url: string;
  email: string;
  address: {
    addressCountry: string;
  };
}

/**
 * Generate Software Application schema for the landing page
 */
export function generateSoftwareApplicationSchema(
  data: SoftwareApplicationSchema,
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data.name,
    description: data.description,
    applicationCategory: data.applicationCategory,
    operatingSystem: data.operatingSystem,
    offers: data.offers
      ? {
          "@type": "Offer",
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
        }
      : undefined,
  });
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(data: OrganizationSchema): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    email: data.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: data.address.addressCountry,
    },
  });
}

/**
 * Generate FAQ Page schema for How It Works section
 */
export function generateFAQPageSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Example question",
        acceptedAnswer: {
          "@type": "Answer",
          text: "example answer",
        },
      },
    ],
  });
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
