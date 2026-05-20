const ALLOWED_CONFIGS = ['prod', 'stage', 'dev'];

/**
 * This function calculates the environment in which the site is running based on the URL.
 * It defaults to 'prod'. In non 'prod' environments, the value can be overwritten using
 * the 'environment' key in sessionStorage.
 *
 * @returns {string} - environment identifier (dev, stage or prod'.
 */
export const calcEnvironment = () => {
  const { host, href } = window.location;
  let environment = 'prod';
  if (href.includes('.aem.page') || host.includes('staging') || href.includes('hvt-eds-qa')) {
    environment = 'stage';
  }
  if (href.includes('localhost') || href.includes('hvt-eds-dev')) {
    environment = 'dev';
  }

  const environmentFromConfig = window.sessionStorage.getItem('environment');
  if (environmentFromConfig && ALLOWED_CONFIGS.includes(environmentFromConfig) && environment !== 'prod') {
    return environmentFromConfig;
  }

  return environment;
};

function buildConfigURL(environment) {
  const env = environment || calcEnvironment();
  let fileName = 'configs.json';
  if (env !== 'prod') {
    fileName = 'configs.json';
  }
  const configURL = new URL(`${window.location.origin}/${fileName}`);
  return configURL;
}

const getConfigForEnvironment = async (environment) => {
  const env = environment || calcEnvironment();

  try {
    const configJSON = window.sessionStorage.getItem(`config:${env}`);
    if (!configJSON) {
      throw new Error('No config in session storage');
    }

    const parsedConfig = JSON.parse(configJSON);
    if (!parsedConfig[':expiry'] || parsedConfig[':expiry'] < Math.round(Date.now() / 1000)) {
      throw new Error('Config expired');
    }

    return parsedConfig;
  } catch (e) {
    let configJSON = await fetch(buildConfigURL(env));
    if (!configJSON.ok) {
      console.warn(`Config not found for ${env}, using defaults`);
      return { data: [] };
    }
    configJSON = await configJSON.json();
    configJSON[':expiry'] = Math.round(Date.now() / 1000) + 7200;
    window.sessionStorage.setItem(`config:${env}`, JSON.stringify(configJSON));
    return configJSON;
  }
};

/**
 * This function retrieves a configuration value for a given environment.
 *
 * @param {string} configParam - The configuration parameter to retrieve.
 * @param {string} [environment] - Optional, overwrite the current environment.
 * @returns {Promise<string|undefined>} - The value of the configuration parameter, or undefined.
 */
export const getConfigValue = async (configParam, environment) => {
  const devGraphqlUrlBase = 'http://localhost:3002';
  if (
    configParam &&
    configParam === 'commerce-core-endpoint' &&
    window.location &&
    window.location.href &&
    window.location.href.indexOf(devGraphqlUrlBase) !== -1
  ) {
    /* eslint-disable-next-line no-console */
    console.log('overriding graphql endpoint to use dev:proxy');
    return `${devGraphqlUrlBase}/api/graphql`;
  }
  const env = environment || calcEnvironment();
  const config = await getConfigForEnvironment(env);
  const configElements = config.data;
  return configElements.find((c) => c.key === configParam)?.value;
};

/**
 * Retrieves headers from config entries like commerce.headers.pdp.my-header, etc and
 * returns as object of all headers like { my-header: value, ... }
 */
export const getHeaders = async (scope, environment) => {
  const env = environment || calcEnvironment();
  const config = await getConfigForEnvironment(env);
  const configElements = config.data.filter((el) => el?.key.includes(`headers.${scope}`));

  return configElements.reduce((obj, item) => {
    let { key } = item;
    if (key.includes(`commerce.headers.${scope}.`)) {
      key = key.replace(`commerce.headers.${scope}.`, '');
    }
    return { ...obj, [key]: item.value };
  }, {});
};

export const getCookie = (cookieName) => {
  const cookies = document.cookie.split(';');
  let foundValue;

  cookies.forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      foundValue = decodeURIComponent(value);
    }
  });

  return foundValue;
};

export const checkIsAuthenticated = () => !!getCookie('auth_dropin_user_token') ?? false;

export const setCookie = (name, value, days = 30, path = '/') => {
  let date;
  let expires;

  if (days) {
    date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  } else {
    expires = '';
  }
  document.cookie = `${name}=${value}${expires}; path=${path}`;
};

export function deleteCookie(cookieName) {
  document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
