import { WireGuard } from './utils/wireguard';

const BASE_URL = 'https://api.cloudflareclient.com';
const HEADERS = {
  Accept: 'application/json',
  'Accept-Encoding': 'gzip',
  'Cf-Client-Version': 'a-6.3-1922',
  'User-Agent': 'okhttp/3.12.1',
};

export async function register(path: string, data = {}) {
  const url = `${BASE_URL}/${path}/reg`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (response.status !== 200) {
    let responseText: string;
    switch (response.status) {
      case 403:
        responseText =
          'Access denied, proxy or your IP is probably blocked on API';
        break;
      case 429:
        responseText =
          'Too Many Requests, too much keys were generated for the last minute from this proxy or your IP';
        break;
      default:
        responseText = await response.text();
    }

    throw new Error(`Failed to register: ${response.status} ${responseText}`);
  }

  const json = await response.json();

  return json;
}

export async function addKey(path: string, regId: any, token: any, key: any) {
  const url = `${BASE_URL}/${path}/reg/${regId}/account`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...HEADERS,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      license: key,
    }),
  });

  if (response.status !== 200) {
    const responseText = await response.text();
    throw new Error(`Failed to add key: ${response.status} ${responseText}`);
  }
}

export async function deleteAccount(path: string, regId: any, token: any) {
  const url = `${BASE_URL}/${path}/reg/${regId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 204) {
    throw new Error(`Failed to delete account: ${response.status}`);
  }
}

export async function getInfo(path: string, regId: any, token: any) {
  const url = `${BASE_URL}/${path}/reg/${regId}`;
  const response = await fetch(url, {
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    const responseText = await response.text();
    throw new Error(
      `Failed to get account: ${response.status} ${responseText}`
    );
  }

  const json = await response.json();

  return { ...json, _regInfo: { path, regId, token } };
}

export async function cloneKey(
  key: any,
  deviceModel: any = null,
  customBody: any = null
) {
  const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
  const private_key = WireGuard.genkey();
  const registerBody = {
    fcm_token: '',
    install_id: '',
    key: WireGuard.pubkey(private_key),
    locale: 'en_US',
    model: 'PC',
    tos: new Date().toISOString(),
    type: 'Android',
    ...customBody,
  };
  if (deviceModel) {
    registerBody['type'] = 'Android';
    registerBody['mod2el'] = deviceModel;
  }
  const registerData = await register(path, registerBody);
  const referrerBody = {
    fcm_token: '',
    install_id: '',
    key: WireGuard.pubkey(WireGuard.genkey()),
    locale: 'en_US',
    model: 'PC',
    tos: new Date().toISOString(),
    type: 'Android',
    referrer: registerData.id,
  };
  // const referrerData =  await register(path, referrerBody);
  await addKey(path, registerData.id, registerData.token, key);
  await addKey(
    path,
    registerData.id,
    registerData.token,
    registerData.account.license
  );
  const information = await getInfo(path, registerData.id, registerData.token);
  if (!deviceModel) {
    await deleteAccount(path, registerData.id, registerData.token);
    // await deleteAccount(path, referrerData.id, referrerData.token);
  }
  return { ...information, private_key };
}
