describe("Snippet detail", () => {
    const snippetId = "snippet-1";

    const stubFileTypes = () => {
        cy.intercept("GET", "**/file-types", {
            statusCode: 200,
            body: [
                {
                    language: "printscript",
                    extension: "ps",
                    versions: ["1.0", "1.1"],
                    defaultVersion: "1.0",
                },
            ],
        }).as("getFileTypes");
    };

    const stubListSnippets = () => {
        cy.intercept("GET", "**/snippets?*", {
            statusCode: 200,
            body: {
                items: [
                    {
                        id: snippetId,
                        name: "Alpha",
                        language: "printscript",
                        extension: "ps",
                        version: "1.0",
                        complianceStatus: "VALID",
                        ownerName: "Alice",
                        relation: "OWNER",
                    },
                ],
                page: 0,
                page_size: 10,
                totalElements: 1,
            },
        }).as("getSnippets");
    };

    const stubGetSnippet = () => {
        cy.intercept("GET", `**/snippets/${snippetId}`, {
            statusCode: 200,
            body: {
                id: snippetId,
                name: "Alpha",
                description: "",
                content: "print(1)",
                language: "printscript",
                version: "1.0",
                extension: "ps",
                complianceStatus: "VALID",
                ownerName: "Alice",
                relation: "OWNER",
                lintErrors: [],
                tests: [],
            },
        }).as("getSnippetById");
    };

    const stubUsers = () => {
        cy.intercept("GET", "**/snippets/users", {
            statusCode: 200,
            body: [
                { id: "user-1", name: "Bob", email: "bob@example.com" },
                { id: "user-2", name: "Alice", email: "alice@example.com" },
            ],
        }).as("getUsers");
    };

    const login = () => {
        const username = Cypress.env("AUTH0_USERNAME") as string;
        const password = Cypress.env("AUTH0_PASSWORD") as string;
        cy.loginToAuth0(username, password);
    };

    const openFirstSnippet = () => {
        cy.get('[data-testid="snippet-row"]').first().click();
        cy.contains("h4", "Alpha").should("be.visible");
    };

    beforeEach(() => {
        stubFileTypes();
        stubListSnippets();
        stubGetSnippet();
        stubUsers();

        cy.intercept("POST", `**/snippets/${snippetId}/share`, (req) => {
            expect(req.body).to.deep.include({ userId: "user-1" });
            req.reply({
                statusCode: 200,
                body: {
                    id: snippetId,
                    name: "Alpha",
                    language: "printscript",
                    content: "print(1)",
                    extension: "ps",
                    complianceStatus: "VALID",
                },
            });
        }).as("shareSnippetRequest");

        cy.intercept("POST", `**/snippets/${snippetId}/execute`, (req) => {
            expect(req.body).to.have.property("input");
            req.reply({
                statusCode: 200,
                body: { exitCode: 0, stdout: "OK", stderr: "" },
            });
        }).as("executeSnippetRequest");

        cy.intercept("POST", "**/snippets/format", (req) => {
            expect(req.body).to.have.property("content");
            expect(req.body).to.have.property("language");
            expect(req.body).to.have.property("version");
            req.reply({
                statusCode: 200,
                body: { formatted: "print(  1  )" },
            });
        }).as("formatSnippetRequest");

        cy.intercept("PUT", `**/snippets/${snippetId}`, (req) => {
            const contentType = String(req.headers["content-type"] ?? "");
            expect(contentType).to.include("multipart/form-data");
            req.reply({
                statusCode: 200,
                body: {
                    id: snippetId,
                    name: "Alpha",
                    description: "",
                    content: "print(1)\nconst a:string='test';",
                    language: "printscript",
                    version: "1.0",
                    extension: "ps",
                    complianceStatus: "VALID",
                    ownerName: "Alice",
                    relation: "OWNER",
                },
            });
        }).as("saveSnippetRequest");

        cy.intercept("DELETE", `**/snippets/${snippetId}`, {
            statusCode: 200,
            body: {},
        }).as("deleteSnippetRequest");

        login();
        cy.visit("/");
        cy.wait("@getSnippets");
        openFirstSnippet();
    });

    it("Can share a snippet", () => {
        cy.get('[aria-label="Share"]').click();
        cy.contains("h5", "Share your snippet").should("be.visible");

        cy.wait("@getUsers");
        cy.get(".MuiAutocomplete-root input").first().type("Bob");
        cy.contains("li", "Bob").click();

        cy.contains("button", "Share").click();
        cy.wait("@shareSnippetRequest").its("response.statusCode").should("eq", 200);
    });

    it("Can run snippets", () => {
        cy.contains("button", "Run").click();
        cy.wait("@executeSnippetRequest").its("response.statusCode").should("eq", 200);
        cy.contains("pre", "OK").should("be.visible");
    });

    it("Can format snippets", () => {
        cy.get(".MuiDrawer-paper")
            .find(".npm__react-simple-code-editor__textarea")
            .first()
            .invoke("val")
            .then((before) => {
                cy.get('[data-testid="ReadMoreIcon"]').closest("button").click();
                cy.wait("@formatSnippetRequest");
                cy.get(".MuiDrawer-paper")
                    .find(".npm__react-simple-code-editor__textarea")
                    .first()
                    .invoke("val")
                    .should("not.eq", before);
            });
    });

    it("Can save snippets", () => {
        cy.get(".MuiDrawer-paper")
            .find(".npm__react-simple-code-editor__textarea")
            .first()
            .type("\nconst a:string='test';");

        cy.get('[data-testid="SaveIcon"]').closest("button").should("not.be.disabled").click();
        cy.wait("@saveSnippetRequest").its("response.statusCode").should("eq", 200);
    });

    it("Can delete snippets", () => {
        cy.get('[data-testid="DeleteIcon"]').closest("button").click();
        cy.contains("button", "Delete").click();
        cy.wait("@deleteSnippetRequest").its("response.statusCode").should("eq", 200);
    });
});
