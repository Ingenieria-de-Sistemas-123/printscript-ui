const BACKEND_URL = Cypress.env("BACKEND_URL") as string;

describe('Add snippet tests', () => {
    beforeEach(() => {
        const username = Cypress.env('AUTH0_USERNAME') as string;
        const password = Cypress.env('AUTH0_PASSWORD') as string;

        cy.loginToAuth0(username, password);
    });

    it('Can add snippets manually', () => {
        // 1) Interceptamos la request que trae los tipos de archivo
        cy.intercept('GET', `${BACKEND_URL}/file-types`).as('getFileTypes');

        cy.visit("/");

        // 2) Abrís el flujo de "Add snippet" como ya hacías
        cy.get('.css-9jay18 > .MuiButton-root').click();
        cy.get('.MuiList-root > [tabindex="0"]').click();

        // 3) Esperamos a que realmente se haya pedido `/file-types`
        cy.wait('@getFileTypes');

        // 4) Stub del POST como ya tenías
        cy.intercept('POST', `${BACKEND_URL}/snippets`, (req) => {
            req.reply((res) => {
                expect(res.body).to.include.keys("id", "name", "content", "language")
                expect(res.statusCode).to.eq(200);
            });
        }).as('postRequest');

        // 5) Completamos el formulario
        cy.get('#name').type('Some snippet name');

        cy.get('#demo-simple-select').click();

        // Le damos tiempo extra y verificamos que exista antes de clickear
        cy.get('[data-testid="menu-option-printscript"]', { timeout: 10000 })
            .should('be.visible')
            .click();

        cy.get('[data-testid="add-snippet-code-editor"]').click();
        cy.get('[data-testid="add-snippet-code-editor"]').type(
            `const snippet: String = "some snippet" \n print(snippet)`
        );

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
    });

    it('Can add snippets via file', () => {
        cy.visit("/");

        cy.intercept('POST', `${BACKEND_URL}/snippets`, (req) => {
            req.reply((res) => {
                expect(res.body).to.include.keys("id","name","content","language")
                expect(res.statusCode).to.eq(200);
            });
        }).as('postRequest');

        cy.get('[data-testid="upload-file-input"]').selectFile(
            "cypress/fixtures/example_ps.ps",
            { force: true }
        );

        cy.get('[data-testid="SaveIcon"]').click();

        cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
    });
});
