declare var apiBaseUrl: string;
declare var production: boolean;

export const environment = {
  apiBaseUrl: apiBaseUrl || 'http://localhost:3000/api',
  production: production === true,
};