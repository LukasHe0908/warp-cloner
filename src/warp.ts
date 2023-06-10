const BASE_URL = 'https://api.cloudflareclient.com';
const HEADERS = {
  'User-Agent': 'okhttp/3.12.1',
};

export async function register(path: string, data = {}) {
  const url = `${BASE_URL}/${path}/reg`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json; charset=UTF-8' },
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
      'Content-Type': 'application/json; charset=UTF-8',
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

export async function getAccount(path: string, regId: any, token: any) {
  const url = `${BASE_URL}/${path}/reg/${regId}/account`;
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

  return json;
}

export async function cloneKey(key: any, deviceModel: any) {
  const path = `v0a${Math.floor(Math.random() * 900) + 100}`;
  const registerBody = {};

  if (deviceModel) {
    registerBody['type'] = 'Android';
    registerBody['model'] = deviceModel;
  }

  const registerData = await register(path, registerBody);
  const referrerBody = {
    referrer: registerData.id,
  };

  await register(path, referrerBody);

  await addKey(path, registerData.id, registerData.token, key);
  await addKey(
    path,
    registerData.id,
    registerData.token,
    registerData.account.license
  );

  const information = await getAccount(
    path,
    registerData.id,
    registerData.token
  );

  if (!deviceModel) {
    await deleteAccount(path, registerData.id, registerData.token);
  }

  return information;
}
