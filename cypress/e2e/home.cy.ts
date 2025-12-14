describe('Home', () => {
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

    const login = () => {
        const username = Cypress.env("AUTH0_USERNAME") as string;
        const password = Cypress.env("AUTH0_PASSWORD") as string;
        cy.loginToAuth0(username, password);
    };

    it("Renders home", () => {
        stubFileTypes();
        cy.intercept("GET", "**/snippets**", {
            statusCode: 200,
            body: {
                items: [
                    {
                        id: "snippet-1",
                        name: "Alpha",
                        language: "printscript",
                        extension: "ps",
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

        login();
        cy.visit("/");

        cy.contains(".MuiTypography-h6", "Printscript").should("be.visible");
        cy.get('input[aria-label="search"]').should("be.visible");
        cy.contains("button", "Add Snippet").should("be.visible");
        cy.get('[data-testid="snippet-row"]').should("have.length", 1);
    });

    it("Renders the first snippets", () => {
        stubFileTypes();
        cy.intercept("GET", "**/snippets**", {
            statusCode: 200,
            body: {
                items: Array.from({ length: 3 }).map((_, idx) => ({
                    id: `snippet-${idx + 1}`,
                    name: `Snippet ${idx + 1}`,
                    language: "printscript",
                    extension: "ps",
                    complianceStatus: "VALID",
                    ownerName: "Alice",
                    relation: "OWNER",
                })),
                page: 0,
                page_size: 10,
                totalElements: 3,
            },
        }).as("getSnippets");

        login();
        cy.visit("/");

        cy.get('[data-testid="snippet-row"]').should("have.length.greaterThan", 0);
        cy.get('[data-testid="snippet-row"]').should("have.length.lessThan", 11);
    });

    it("Filters snippets by name", () => {
        stubFileTypes();

        cy.intercept("GET", "**/snippets**", (req) => {
            const name = req.query?.name as string | undefined;
            if (name === "Beta") {
                req.alias = "getSnippetsFiltered";
                req.reply({
                    statusCode: 200,
                    body: {
                        items: [
                            {
                                id: "snippet-2",
                                name: "Beta",
                                language: "printscript",
                                extension: "ps",
                                complianceStatus: "VALID",
                                ownerName: "Alice",
                                relation: "OWNER",
                            },
                        ],
                        page: 0,
                        page_size: 10,
                        totalElements: 1,
                    },
                });
                return;
            }

            req.alias = "getSnippets";
            req.reply({
                statusCode: 200,
                body: {
                    items: [
                        {
                            id: "snippet-1",
                            name: "Alpha",
                            language: "printscript",
                            extension: "ps",
                            complianceStatus: "VALID",
                            ownerName: "Alice",
                            relation: "OWNER",
                        },
                        {
                            id: "snippet-2",
                            name: "Beta",
                            language: "printscript",
                            extension: "ps",
                            complianceStatus: "VALID",
                            ownerName: "Alice",
                            relation: "OWNER",
                        },
                    ],
                    page: 0,
                    page_size: 10,
                    totalElements: 2,
                },
            });
        });

        login();
        cy.visit("/");

        cy.get('input[aria-label="search"]').clear().type("Beta");
        cy.wait("@getSnippetsFiltered");

        cy.contains("td", "Beta").should("be.visible");
        cy.contains("td", "Alpha").should("not.exist");
    });
})
