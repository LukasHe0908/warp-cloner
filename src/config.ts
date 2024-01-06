import dotenv from 'dotenv';
dotenv.config();

function config() {
  let config = {
    BASE_KEYS: [],
    THREADS_COUNT: 1,
    PROXY_FILE: null,
    DEVICE_MODELS: [],
    DELAY: 25,
    OUTPUT_FILE: 'output.txt',
    OUTPUT_FORMAT:
      'id       {id}\ntoken    {reg_token}\nlicense  {account.license}\nreferral {account.referral_count}\n---',
    RETRY_COUNT: 3,
    ...process.env,
  };
  if (process.env.BASE_KEYS) {
    config.BASE_KEYS = process.env.BASE_KEYS.split(',');
  }

  return config;
}

export default config();
