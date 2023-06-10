import fs from 'fs';
import { cloneKey } from './warp';
import config from './config';
import keyDispatcher from './utils/keys';

async function customCloneKey(keyToClone: any, retryCount = 0) {
  if (retryCount > config.RETRY_COUNT) {
    return null;
  }

  try {
    const deviceModel =
      config.DEVICE_MODELS.length > 0
        ? config.DEVICE_MODELS[
            Math.floor(Math.random() * config.DEVICE_MODELS.length)
          ]
        : null;

    const key = await cloneKey(keyToClone, deviceModel);

    keyDispatcher.addKey(key.license);

    return key;
  } catch (error) {
    console.error(`${error} (key: ${keyToClone})`);
    await new Promise(resolve => setTimeout(resolve, config.DELAY));

    return customCloneKey(keyToClone, retryCount + 1);
  }
}

async function worker(id: number) {
  console.debug(`Worker ${id} started`);

  const key = await customCloneKey(keyDispatcher.getKey());

  if (key !== null) {
    const output = config.OUTPUT_FORMAT.replace('{key}', key.license).replace(
      '{referral_count}',
      key.referral_count
    );

    console.log(output);

    fs.appendFileSync(config.OUTPUT_FILE, output + '\n');
  }
  setTimeout(() => {
    worker(id);
  }, config.DELAY);
}

async function main() {
  for (let i = 0; i < config.THREADS_COUNT; i++) {
    worker(i + 1);
  }
}
main();
