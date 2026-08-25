const CHAPA_API_BASE_URL = "https://api.chapa.co/v1";
const DEFAULT_CHAPA_CURRENCY = "ETB";

type ChapaConfig = {
  apiBaseUrl: string;
  secretKey: string;
  webhookSecret: string;
  txRefSecret: string;
  currency: string;
  appBaseUrl: string;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getChapaConfig(): ChapaConfig {
  return {
    apiBaseUrl: process.env.CHAPA_API_BASE_URL?.trim() || CHAPA_API_BASE_URL,
    secretKey: requiredEnv("CHAPA_SECRET_KEY"),
    webhookSecret: requiredEnv("CHAPA_WEBHOOK_SECRET"),
    txRefSecret: requiredEnv("CHAPA_TX_REF_SECRET"),
    currency: (process.env.CHAPA_CURRENCY?.trim() || DEFAULT_CHAPA_CURRENCY).toUpperCase(),
    appBaseUrl: normalizeBaseUrl(requiredEnv("APP_BASE_URL")),
  };
}
