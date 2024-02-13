import { randomBytes } from 'crypto';
import * as tweetnacl from 'tweetnacl';

export class WireGuard {
  static KeyLength = 32;

  static genkey(): string {
    const keyData = randomBytes(this.KeyLength);
    return keyData.toString('base64');
  }

  static pubkey(privkey: string): string {
    const privateKey = Buffer.from(privkey, 'base64');
    const publicKey = tweetnacl.scalarMult.base(privateKey);
    return Buffer.from(publicKey).toString('base64');
  }
}

// Example usage:
// const privateKey = WireGuard.genkey();
// const publicKey = WireGuard.pubkey(privateKey);
// console.log('Private Key:', privateKey);
// console.log('Public Key:', publicKey);
