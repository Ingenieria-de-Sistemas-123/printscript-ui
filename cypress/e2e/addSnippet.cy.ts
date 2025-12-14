describe('Add snippet tests', () => {
    const stubFileTypes = () => {
        cy.intercept("GET", "**/file-types", {
            statusCode: 200,
            body: [
                {
                    language: "printscript",
                    extension: "prs",
                    versions: ["1.0", "1.1"],
                    defaultVersion: "1.0",
                },
            ],
        }).as("getFileTypes");
    };

    const stubCreateSnippet = () => {
        cy.intercept("POST", "**/snippets", (req) => {
            const contentType = String(req.headers["content-type"] ?? "");
            expect(contentType).to.include("multipart/form-data");

            req.reply({
                statusCode: 200,
                body: {
                    id: "snippet-created",
                    name: "Some snippet name",
                    description: "",
                    content: `let snippet: string = "some snippet"\nprintln(snippet)`,
                    language: "printscript",
                    version: "1.0",
                    extension: "prs",
                    complianceStatus: "VALID",
                    ownerName: "Alice",
                    relation: "OWNER",
                },
            });
        }).as("createSnippet");
    };

    const login = () => {
        const username = Cypress.env("AUTH0_USERNAME") as string;
        const password = Cypress.env("AUTH0_PASSWORD") as string;
        cy.loginToAuth0(username, password);
    };

    const typeInEditor = (testId: string, text: string) => {
        cy.get(testId).then(($el) => {
            if ($el.is("textarea")) {
                cy.wrap($el).clear().type(text);
                return;
            }
            cy.wrap($el).find("textarea").first().clear().type(text);
        });
    };

    it('Can add snippets manually', () => {
        stubFileTypes();
        stubCreateSnippet();
        login();

        cy.visit("/");
        cy.wait("@getFileTypes");

        cy.contains("button", "Add Snippet").click();
        cy.contains("li", "Create snippet").click();

        cy.contains("h2", "Add Snippet").should("be.visible");

        cy.get("#name").type("Some snippet name");
        typeInEditor(
            '[data-testid="add-snippet-code-editor"]',
            `let snippet: string = "some snippet"\nprintln(snippet)`
        );

        cy.contains("button", "Save Snippet").should("not.be.disabled").click();
        cy.wait("@createSnippet").its("response.statusCode").should("eq", 200);
    });

    it('Can add snippets via file', () => {
        stubFileTypes();
        stubCreateSnippet();
        login();

        cy.visit("/");
        cy.wait("@getFileTypes");

        cy.get('[data-testid="upload-file-input"]').selectFile(
            "cypress/fixtures/example_ps.prs",
            { force: true }
        );

        cy.contains("h2", "Add Snippet").should("be.visible");
        cy.contains("button", "Save Snippet").should("not.be.disabled").click();

        cy.wait("@createSnippet").its("response.statusCode").should("eq", 200);
    });
});
