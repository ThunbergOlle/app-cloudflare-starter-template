const ip = require('ip');

const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.EAS_BUILD_PROFILE === 'production';

const getBackendUrl = () => {
  // Check if we're in EAS Update production environment
  if (isProduction) {
    return 'https://example.com/trpc';
  }

  // Development environment
  if (process.env.NODE_ENV === 'development') {
    const localIp = ip.address();
    return `http://${localIp}:8787/trpc`;
  }

  throw new Error('Unknown environment for backend URL');
};

module.exports = ({ config }) => {
  return {
    ...config,
    name: isProduction ? 'Example' : 'Example (Dev)',
    slug: 'example-app',
    extra: {
      ...config.extra,
      backendUrl: getBackendUrl(),
      environment: isProduction ? 'production' : 'development',
    },
    updates: {
      url: '',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
