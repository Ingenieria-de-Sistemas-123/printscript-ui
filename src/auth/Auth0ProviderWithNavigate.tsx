import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

export default function Auth0ProviderWithNavigate({
                                                      children,
                                                  }: {
    children: React.ReactNode;
}) {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string;
    const redirectUri =
        (import.meta.env.VITE_AUTH0_CALLBACK_URL as string) ||
        window.location.origin;

    const onRedirectCallback = (appState?: { returnTo?: string }) => {
        const target =
            appState?.returnTo ||
            window.location.pathname + window.location.search;

        window.history.replaceState({}, document.title, target);
    };

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience,
                // 👇 sin offline_access
                scope: "openid read:snippets write:snippets read:permissions write:permissions",
            }}
            cacheLocation="localstorage"
            // 👇 desactivamos refresh tokens
            useRefreshTokens={false}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
}
