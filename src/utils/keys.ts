import config from '../config';

function* mutableCycle(arr: string | any[]) {
  while (true) {
    let i = 0;
    while (i < arr.length) {
      yield arr[i];
      i += 1;
    }
  }
}

class KeyDispenser {
  private keys: any[];
  private key_cycle: Generator<any, void, unknown>;
  constructor(keys: any[]) {
    this.keys = keys;
    this.key_cycle = mutableCycle(this.keys);
  }

  public addKey(key: any) {
    this.keys.push(key);
  }

  public getKey() {
    // console.log(this.keys);
    if (this.keys === null || this.keys.length === 0) {
      throw new Error('No keys available');
    }
    return this.key_cycle.next().value;
  }
}

const key_dispatcher = new KeyDispenser(config.BASE_KEYS);

export default key_dispatcher;
