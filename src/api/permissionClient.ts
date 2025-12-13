// src/api/permissionClient.ts
export type UserAccountDto = {
    id: string;
    auth0Sub: string;
    email: string;
    name: string;
    picture: string | null;
    createdAt: string;
    updatedAt: string;
};

const PERMISSION_BASE_URL = "http://localhost:8080/api";

export async function syncCurrentUser(token: string): Promise<UserAccountDto> {
    const resp = await fetch(`${PERMISSION_BASE_URL}/me/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!resp.ok) {
        throw new Error(`Permission sync failed: ${resp.status}`);
    }

    return resp.json();
}

export async function getCurrentUser(token: string): Promise<UserAccountDto> {
    const resp = await fetch(`${PERMISSION_BASE_URL}/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!resp.ok) {
        throw new Error(`Get current user failed: ${resp.status}`);
    }

    return resp.json();
}
