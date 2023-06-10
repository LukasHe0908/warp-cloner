import dotenv from 'dotenv';
dotenv.config();

const config = {
  BASE_KEYS: [],
  THREADS_COUNT: 1,
  PROXY_FILE: null,
  DEVICE_MODELS: [],
  DELAY: 25,
  OUTPUT_FILE: 'output.txt',
  OUTPUT_FORMAT: '{key} | {referral_count}',
  RETRY_COUNT: 3,
  ...process.env,
};

export default config;
