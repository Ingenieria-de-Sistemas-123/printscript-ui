import "./commands";
import { loginViaAuth0Ui } from "./auth-provider-commands/auth0";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
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
