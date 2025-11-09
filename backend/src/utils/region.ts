export function getLocaleForRegion(region: string): string | undefined {
  const regionToLocale: Record<string, string> = {
    AL: 'sq', // Albania
    AD: 'ca', // Andorra
    AM: 'hy', // Armenia
    AT: 'de', // Austria
    AZ: 'az', // Azerbaijan
    BY: 'be', // Belarus
    BE: 'nl', // Belgium (Dutch as primary)
    BA: 'bs', // Bosnia and Herzegovina
    BG: 'bg', // Bulgaria
    HR: 'hr', // Croatia
    CY: 'el', // Cyprus (Greek)
    CZ: 'cs', // Czechia
    DK: 'da', // Denmark
    EE: 'et', // Estonia
    FI: 'fi', // Finland
    FR: 'fr', // France
    GE: 'ka', // Georgia
    DE: 'de', // Germany
    GR: 'el', // Greece
    HU: 'hu', // Hungary
    IS: 'is', // Iceland
    IE: 'en', // Ireland
    IT: 'it', // Italy
    KZ: 'kk', // Kazakhstan (partly Europe)
    XK: 'sq', // Kosovo (Albanian)
    LV: 'lv', // Latvia
    LI: 'de', // Liechtenstein
    LT: 'lt', // Lithuania
    LU: 'lb', // Luxembourg
    MT: 'mt', // Malta
    MD: 'ro', // Moldova
    MC: 'fr', // Monaco
    ME: 'sr', // Montenegro
    NL: 'nl', // Netherlands
    MK: 'mk', // North Macedonia
    NO: 'no', // Norway
    PL: 'pl', // Poland
    PT: 'pt', // Portugal
    RO: 'ro', // Romania
    RU: 'ru', // Russia
    SM: 'it', // San Marino
    RS: 'sr', // Serbia
    SK: 'sk', // Slovakia
    SI: 'sl', // Slovenia
    ES: 'es', // Spain
    CN: 'es', // Spain
    SE: 'sv', // Sweden
    CH: 'de', // Switzerland (German as primary)
    TR: 'tr', // Turkey (partly Europe)
    UA: 'uk', // Ukraine
    GB: 'en', // United Kingdom
    VA: 'it', // Vatican City
  };

  return regionToLocale[region.toUpperCase()];
}
