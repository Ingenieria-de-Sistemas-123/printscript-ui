import {ComplianceEnum, CreateSnippet, Snippet, UpdateSnippet} from '../snippet'
import {v4 as uuid} from 'uuid'
import {Friends} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import {SnippetTestExecution} from "../../types/snippetDetails.ts";

const INITIAL_SNIPPETS: Snippet[] = [
    {
        id: '9af91631-cdfc-4341-9b8e-3694e5cb3672',
        name: 'Super Snippet',
        content: 'let a : number = 5;\nlet b : number = 5;\n\nprintln(a + b);',
        compliance: 'pending',
        author: 'John Doe',
        language: 'printscript',
        extension: 'prs'
    },
    {
        id: 'c48cf644-fbc1-4649-a8f4-9dd7110640d9',
        name: 'Extra cool Snippet',
        content: 'let a : number = 5;\nlet b : number = 5;\n\nprintln(a + b);',
        compliance: 'not-compliant',
        author: 'John Doe',
        language: 'printscript',
        extension: 'prs'
    },
    {
        id: '34bf4b7a-d4a1-48be-bb26-7d9a3be46227',
        name: 'Boaring Snippet',
        content: 'let a : number = 5;\nlet b : number = 5;\n\nprintln(a + b);',
        compliance: 'compliant',
        author: 'John Doe',
        language: 'printscript',
        extension: 'prs'
    }
]

export const friendsMock = [
  {
    id: "1",
    name: "Chona",
    email: "chona@example.com",
  },
  {
    id: "2",
    name: "Fede",
    email: "fede@example.com",
  },
  {
    id: "3",
    name: "Mateo",
    email: "mateo@example.com",
  },
  {
    id: "4",
    name: "Tomi",
    email: "tomi@example.com",
  },
  {
    id: "5",
    name: "Javi",
    email: "javi@example.com",
  }
] satisfies Friends[];

const INITIAL_FORMATTING_RULES: Rule[] = [
    { id: "spaceBeforeColon", name: "Espacio antes de ':'", active: true, value: null },
    { id: "spaceAfterColon", name: "Espacio después de ':'", active: true, value: null },
    { id: "spaceAroundEquals", name: "Espacio alrededor de '='", active: true, value: null },
    { id: "spaceAroundOperators", name: "Espacio alrededor de operadores", active: true, value: null },
    { id: "lineJumpAfterSemicolon", name: "Salto de línea tras ';'", active: true, value: null },
    { id: "singleSpaceSeparation", name: "Separación de 1 espacio", active: true, value: null },
    { id: "indentSize", name: "Tamaño de indentación", active: true, value: 2 },
]

const INITIAL_LINTING_RULES: Rule[] = [
    { id: "no-duplicate-var", name: "Variables duplicadas", active: true, value: null },
    { id: "identifier-style", name: "Estilo de identificadores", active: true, value: null },
    { id: "println-restriction", name: "Restricción de println", active: true, value: null },
    { id: "string-number-concat", name: "Concat string + number", active: true, value: null },
    { id: "read-input-prompt", name: "Prompt en readInput", active: true, value: null },
]

const fakeTestCases: TestCase[] = [
    {
        id: uuid(),
        name: "Test Case 1",
        description: "Debe sumar correctamente",
        input: ["A", "B"],
        expectedOutput: "C",
        lastRunExitCode: 0,
        lastRunOutput: "C",
        lastRunAt: new Date().toISOString(),
    },
    {
        id: uuid(),
        name: "Test Case 2",
        description: "Error esperado",
        input: ["1", "2"],
        expectedOutput: "3",
        lastRunExitCode: 1,
        lastRunError: "Mismatch",
        lastRunOutput: "4",
        lastRunAt: new Date().toISOString(),
    },
]

const fileTypes: FileType[] = [
    {
        language: "printscript",
        extension: "prs",
    },
    {
        language: "python",
        extension: "py",
    },
    {
        language: "java",
        extension: "java",
    },
    {
        language: 'golang',
        extension: 'go'
    }
]

export class FakeSnippetStore {
    private readonly snippetMap: Map<string, Snippet> = new Map()
    private readonly snippetTests: Map<string, TestCase[]> = new Map()
    private formattingRules: Rule[] = [];
    private lintingRules: Rule[] = [];

    constructor() {
        INITIAL_SNIPPETS.forEach(snippet => {
            this.snippetMap.set(snippet.id, snippet)
        })

        INITIAL_SNIPPETS.forEach(snippet => {
            // clone tests per snippet
            const clonedTests = fakeTestCases.map(tc => ({...tc, id: uuid()}))
            this.snippetTests.set(snippet.id, clonedTests)
        })
        this.formattingRules = INITIAL_FORMATTING_RULES
        this.lintingRules = INITIAL_LINTING_RULES
    }

    listSnippetDescriptors(): Snippet[] {
        return Array.from(this.snippetMap, ([, value]) => value)
    }

    createSnippet(createSnippet: CreateSnippet): Snippet {
        const id = uuid();
        const newSnippet = {
            id,
            compliance: 'compliant' as ComplianceEnum,
            author: 'yo',
            ...createSnippet
        }
        this.snippetMap.set(id, newSnippet)

        return newSnippet
    }

    getSnippetById(id: string): Snippet | undefined {
        return this.snippetMap.get(id)
    }

    updateSnippet(id: string, updateSnippet: UpdateSnippet): Snippet {
        const existingSnippet = this.snippetMap.get(id)

        if (existingSnippet === undefined)
            throw Error(`Snippet with id ${id} does not exist`)

        const newSnippet = {
            ...existingSnippet,
            ...updateSnippet
        }
        this.snippetMap.set(id, newSnippet)

        return newSnippet
    }

  getUserFriends() {
    return friendsMock;
  }

    getFormatRules(): Rule[] {
        return this.formattingRules
    }

    getLintingRules(): Rule[] {
        return this.lintingRules
    }

    formatSnippet(snippetContent: string): string {
        return `//Mocked format of snippet :) \n${snippetContent}`
    }

    getTestCases(snippetId: string): TestCase[] {
        return [...(this.snippetTests.get(snippetId) ?? [])]
    }

    upsertTestCase(snippetId: string, testCase: Partial<TestCase>): TestCase {
        const current = this.snippetTests.get(snippetId) ?? []
        if (testCase.id) {
            const updated = current.map(tc => tc.id === testCase.id ? {
                ...tc,
                ...testCase,
                expectedOutput: testCase.expectedOutput ?? tc.expectedOutput ?? "",
            } as TestCase : tc)
            this.snippetTests.set(snippetId, updated)
            return updated.find(tc => tc.id === testCase.id) as TestCase
        }
        const id = uuid()
        const newTestCase = {
            ...testCase,
            id,
            expectedOutput: testCase.expectedOutput ?? "",
        } as TestCase
        this.snippetTests.set(snippetId, [...current, newTestCase])
        return newTestCase
    }

    removeTestCase(snippetId: string, id: string): string {
        const current = this.snippetTests.get(snippetId) ?? []
        this.snippetTests.set(snippetId, current.filter(tc => tc.id !== id))
        return id
    }

    deleteSnippet(id: string): string {
        this.snippetMap.delete(id)
        return id
    }

    executeSnippetTest(snippetId: string, testId: string): SnippetTestExecution {
        const now = new Date().toISOString()
        const test = (this.snippetTests.get(snippetId) ?? []).find(tc => tc.id === testId)
        const stdout = test?.expectedOutput ?? "OK"
        const passed = true
        const execution: SnippetTestExecution = {
            id: testId,
            passed,
            exitCode: 0,
            stdout,
            stderr: null,
            lastRunAt: now,
        }
        if (test) {
            this.upsertTestCase(snippetId, {
                ...test,
                lastRunExitCode: execution.exitCode,
                lastRunOutput: execution.stdout ?? undefined,
                lastRunError: execution.stderr ?? undefined,
                lastRunAt: now,
            })
        }
        return execution
    }

    getFileTypes(): FileType[] {
        return fileTypes
    }

    modifyFormattingRule(newRules: Rule[]): Rule[] {
        this.formattingRules = newRules;
        return newRules;
    }

    modifyLintingRule(newRules: Rule[]): Rule[] {
        this.lintingRules = newRules
        return newRules
    }
}
