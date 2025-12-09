export function loginViaAuth0Ui(username: string, password: string) {
    // La app en "/" redirige a Auth0
    cy.visit("/");

    const domain = Cypress.env("AUTH0_DOMAIN") as string;
    if (!domain) {
        throw new Error("AUTH0_DOMAIN no está configurado en Cypress.env");
    }

    cy.origin(
        domain,
        { args: { username, password } },
        ({ username, password }) => {
            cy.get("input#username").type(username);
            cy.get("input#password").type(password, { log: false });
            cy.contains("button[value=default]", "Continue").click();
        }
    );

    // Aseguramos que Auth0 nos devolvió a la app
    cy.url().should("equal", "http://localhost:3000/");
}
