describe('Protected routes test', () => {
    const getAuth0Origin = () => {
        const raw = Cypress.env("AUTH0_DOMAIN") as string;
        if (!raw) throw new Error("AUTH0_DOMAIN no está configurado");
        return raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    };

    it('should redirect to login when accessing a protected route unauthenticated', () => {
        const auth0Origin = getAuth0Origin();

        cy.clearCookies();
        cy.clearLocalStorage();

        cy.visit("/rules");

        cy.origin(auth0Origin, () => {
            cy.get("input#username", { timeout: 15000 }).should("be.visible");
        });
    });

    it('should display login content', () => {
        const auth0Origin = getAuth0Origin();

        cy.clearCookies();
        cy.clearLocalStorage();

        cy.visit("/");

        cy.origin(auth0Origin, () => {
            cy.get("input#username").should("be.visible");
            cy.get("input#password").should("be.visible");
            cy.contains("button[value=default]", "Continue").should("be.visible");
        });
    });

    it('should not redirect to login when the user is already authenticated', () => {
        const username = Cypress.env("AUTH0_USERNAME") as string;
        const password = Cypress.env("AUTH0_PASSWORD") as string;

        cy.intercept("GET", "**/snippets/rules/formatting", { statusCode: 200, body: [] });
        cy.intercept("GET", "**/snippets/rules/linting", { statusCode: 200, body: [] });

        cy.loginToAuth0(username, password);
        cy.visit("/rules");

        cy.url().should("include", "/rules");
        cy.contains("button", "Logout").should("be.visible");
    });

})
