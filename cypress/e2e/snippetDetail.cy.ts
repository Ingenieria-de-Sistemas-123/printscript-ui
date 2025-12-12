import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL, FRONTEND_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )

        cy.visit(FRONTEND_URL)

        cy.wait(2000)
        cy.get('.MuiTableBody-root > :nth-child(2) > :nth-child(2)').click();
    })

    it('Can share a snippet ', () => {
        cy.intercept('POST', BACKEND_URL+"/snippets/share", (req) => {
            req.reply((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('shareSnippetRequest');
        cy.get('[aria-label="Share"]').click();
        cy.get('#\\:rl\\:').click();
        cy.get('#\\:rl\\:-option-0').click();
        cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();
        cy.wait('@shareSnippetRequest').its('response.statusCode').should('eq', 200);
    })

    it('Can run snippets', function() {
        cy.get('[data-testid="PlayArrowIcon"]').click();
        cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').should("have.length.greaterThan",0);
    });

    it('Can format snippets', function() {
        const content = cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').invoke('text');
        cy.get('[data-testid="ReadMoreIcon"] > path').click();
        const formatedContent = cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').invoke('text');
        expect(content).not.to.eq(formatedContent);
    });

    it('Can save snippets', function() {
        cy.intercept('PUT', BACKEND_URL+"/snippets/*", (req) => {
            req.reply((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('saveSnippetRequest');
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
        cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type("\nconst a:string='test';");
        cy.get('[data-testid="SaveIcon"] > path').click();
        cy.wait('@saveSnippetRequest').its('response.statusCode').should('eq', 200);
    });

    it('Can delete snippets', function() {
        cy.intercept('DELETE', BACKEND_URL+"/snippets/*", (req) => {
            req.reply((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('deleteSnippetRequest');
        cy.get('[data-testid="DeleteIcon"] > path').click();
        cy.contains('button', 'Delete').click();
        cy.wait('@deleteSnippetRequest').its('response.statusCode').should('eq', 200);
    });
})