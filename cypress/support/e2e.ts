// cypress/support/e2e.ts

import "./commands";
import { loginViaAuth0Ui } from "./auth-provider-commands/auth0";

// (Opcional pero prolijo si usás TypeScript)
declare global {
    namespace Cypress {
        interface Chainable {
            loginToAuth0(username: string, password: string): Chainable<void>;
        }
    }
}

Cypress.Commands.add(
    "loginToAuth0",
    (username: string, password: string) => {
        const log = Cypress.log({
            displayName: "AUTH0 LOGIN",
            message: [`🔐 Authenticating | ${username}`],
            autoEnd: false,
        });

        cy.session(
            `auth0-${username}`,
            () => {
                // Acá se hace todo el flujo de login real
                loginViaAuth0Ui(username, password);
                // Ojo: loginViaAuth0Ui YA tiene:
                // cy.url().should('equal', 'http://localhost:3000/')
                // así que cuando termina, estamos logueados y de vuelta en la app.
            }
            //SACAMOS el "validate", no hace falta
        );

        log.end();
    }
);

// Hook global: antes de cada test, loguearse con las env de Cypress
beforeEach(() => {
    const username = Cypress.env("AUTH0_USERNAME") as string;
    const password = Cypress.env("AUTH0_PASSWORD") as string;

    if (!username || !password) {
        throw new Error(
            "AUTH0_USERNAME o AUTH0_PASSWORD no están configurados en Cypress.env"
        );
    }

    cy.loginToAuth0(username, password);
});
