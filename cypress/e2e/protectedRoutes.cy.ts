import {AUTH0_DOMAIN, AUTH0_PASSWORD, AUTH0_USERNAME, FRONTEND_URL} from "../../src/utils/constants";

describe('Protected routes test', () => {
    it('should redirect to login when accessing a protected route unauthenticated', () => {
        // Visit the protected route
        cy.visit(`${FRONTEND_URL}/user-rules`);

        // Check if the URL is redirected to the login page

        cy.contains('button', 'Log in').should('exist');
    });

    it('should display login content', () => {
        // Visit the login page
        cy.visit(FRONTEND_URL);
        cy.contains('button', 'Log in').click();

        cy.origin(AUTH0_DOMAIN, () => {
            cy.contains('Log in').should('exist');
            cy.contains('button', 'Continue').should('exist');
        });
    });

    it('should not redirect to login when the user is already authenticated', () => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit(FRONTEND_URL);

        cy.wait(1000)

        // Check if the URL is redirected to the login page
        cy.url().should('not.include', '/login');
    });

})