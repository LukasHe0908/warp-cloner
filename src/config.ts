import dotenv from 'dotenv';
dotenv.config();

function config() {
  let config = {
    BASE_KEYS: [],
    THREADS_COUNT: 1,
    PROXY_FILE: null,
    DEVICE_MODELS: [],
    DELAY: 5000,
    OUTPUT_FILE: 'output.txt',
    OUTPUT_FORMAT:
      'license  {account.license}\nreferral {account.referral_count}\n---',
    RETRY_COUNT: 3,
    ...process.env,
  };
  if (process.env.BASE_KEYS) {
    config.BASE_KEYS = process.env.BASE_KEYS.split(',');
  }

  return config;
}

export default config();
