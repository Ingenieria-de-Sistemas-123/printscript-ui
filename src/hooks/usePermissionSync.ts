import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { UserAccountDto } from "../api/permissionClient.ts";

const PERMISSION_BASE_URL =
    (import.meta.env.VITE_PERMISSION_BASE_URL as string) ?? "/api";

export const usePermissionSync = () => {
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

    const [userAccount, setUserAccount] = useState<UserAccountDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        console.log(
            "[usePermissionSync] effect",
            "isAuthenticated=",
            isAuthenticated,
            "isLoading=",
            isLoading,
        );

        if (isLoading) return;

        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);

                const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string;

                const token = await getAccessTokenSilently({
                    authorizationParams: { audience },
                });

                console.log("[usePermissionSync] got token:", token.slice(0, 15) + "...");

                const resp = await fetch(`${PERMISSION_BASE_URL}/me/sync`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                console.log("[usePermissionSync] /me/sync status:", resp.status);

                if (!resp.ok) {
                    throw new Error(`Sync failed with status ${resp.status}`);
                }

                const body = (await resp.json()) as UserAccountDto;
                console.log("[usePermissionSync] userAccount:", body);

                setUserAccount(body);
                setError(null);
            } catch (e) {
                console.error("[usePermissionSync] error:", e);
                setError(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated, isLoading, getAccessTokenSilently]);

    return { userAccount, loading, error };
};
