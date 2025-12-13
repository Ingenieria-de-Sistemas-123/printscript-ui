import type { GetTokenSilentlyOptions } from "@auth0/auth0-react";

export async function authFetch(
    url: string,
    init: RequestInit,
    getAccessTokenSilently: (options?: GetTokenSilentlyOptions) => Promise<string>
) {
    const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE as string },
    });
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return fetch(url, { ...init, headers });
}
