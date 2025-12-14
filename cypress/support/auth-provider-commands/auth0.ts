export function loginViaAuth0Ui(username: string, password: string) {
    // La app en "/" redirige a Auth0
    cy.visit("/");

    const domainRaw = Cypress.env("AUTH0_DOMAIN") as string;
    if (!domainRaw) {
        throw new Error("AUTH0_DOMAIN no está configurado en Cypress.env");
    }
    const auth0Origin = domainRaw.startsWith("http://") || domainRaw.startsWith("https://")
        ? domainRaw
        : `https://${domainRaw}`;

    cy.origin(
        auth0Origin,
        { args: { username, password } },
        ({ username, password }) => {
            cy.get("input#username").type(username);
            cy.get("input#password").type(password, { log: false });
            cy.contains("button[value=default]", "Continue").click();
        }
    );

    // Aseguramos que Auth0 nos devolvió a la app
    const baseUrl = (Cypress.config("baseUrl") as string | undefined) ?? "http://localhost:3000";
    const normalizedBase = baseUrl.replace(/\/+$/, "");
    cy.url().should("equal", `${normalizedBase}/`);
}
