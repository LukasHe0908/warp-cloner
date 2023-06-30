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
  // console.log(key);

  if (key !== null) {
    const output = config.OUTPUT_FORMAT.replace(/\\n/g, '\n')
      // .replace(/{reg_path}/g, key._regInfo.path)
      // .replace(/{reg_id}/g, key._regInfo.regId)
      .replace(/{reg_token}/g, key._regInfo.token)
      .replace(/{id}/g, key.id)
      // .replace(/{type}/g, key.type)
      // .replace(/{name}/g, key.name)
      // .replace(/{warp_enabled}/g, key.warp_enabled)
      // .replace(/{waitlist_enabled}/g, key.waitlist_enabled)
      // .replace(/{created}/g, key.created)
      // .replace(/{updated}/g, key.updated)
      // .replace(/{place}/g, key.place)
      // .replace(/{locale}/g, key.locale)
      // .replace(/{enabled}/g, key.enabled)
      // .replace(/{install_id}/g, key.install_id)
      // .replace(/{account.id}/g, key.account.id)
      // .replace(/{account.account_type}/g, key.account.account_type)
      // .replace(/{account.created}/g, key.account.created)
      // .replace(/{account.updated}/g, key.account.updated)
      // .replace(/{account.premium_data}/g, key.account.premium_data)
      // .replace(/{account.quota}/g, key.account.quota)
      // .replace(/{account.warp_plus}/g, key.account.warp_plus)
      .replace(/{account.referral_count}/g, key.account.referral_count)
      // .replace(/{account.referral_renewal_countdown}/g, key.account.referral_renewal_countdown)
      // .replace(/{account.role}/g, key.child)
      .replace(/{account.license}/g, key.account.license);

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
