import { frontendConfig } from '../config/appConfig';

export async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${frontendConfig.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
