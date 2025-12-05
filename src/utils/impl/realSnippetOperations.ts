// TypeScript
// `src/utils/realSnippetOperations.ts`
import {SnippetOperations} from '../snippetOperations'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import {PaginatedUsers} from "../users"
import {TestCase} from "../../types/TestCase"
import {TestCaseResult} from "../queries"
import {FileType} from "../../types/FileType"
import {Rule} from "../../types/Rule"

type TokenGetter = () => Promise<string | undefined>
const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080"

async function authHeaders(getToken?: TokenGetter) {
    const headers: Record<string,string> = { "Content-Type": "application/json" }
    if (getToken) {
        const token = await getToken()
        if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
}

export class RealSnippetOperations implements SnippetOperations {
    constructor(private getToken?: TokenGetter) {}

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        const q = new URLSearchParams({ page: String(page), page_size: String(pageSize), name: snippetName ?? "" })
        const res = await fetch(`${BASE_URL}/snippets?${q.toString()}`, { headers: await authHeaders(this.getToken) })
        if (!res.ok) throw new Error("Error listando snippets")
        return res.json()
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const res = await fetch(`${BASE_URL}/snippets`, {
            method: "POST",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(createSnippet)
        })
        if (!res.ok) throw new Error("Error creando snippet")
        return res.json()
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        const res = await fetch(`${BASE_URL}/snippets/${id}`, { headers: await authHeaders(this.getToken) })
        if (res.status === 404) return undefined
        if (!res.ok) throw new Error("Error obteniendo snippet")
        return res.json()
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const res = await fetch(`${BASE_URL}/snippets/${id}`, {
            method: "PUT",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(updateSnippet)
        })
        if (!res.ok) throw new Error("Error actualizando snippet")
        return res.json()
    }

    async getUserFriends(name: string = "", page: number = 0, pageSize: number = 10): Promise<PaginatedUsers> {
        const q = new URLSearchParams({ name, page: String(page), page_size: String(pageSize) })
        const res = await fetch(`${BASE_URL}/users?${q.toString()}`, { headers: await authHeaders(this.getToken) })
        if (!res.ok) throw new Error("Error listando usuarios")
        return res.json()
    }

    async shareSnippet(snippetId: string, userId: string): Promise<Snippet> {
        const res = await fetch(`${BASE_URL}/snippets/${snippetId}/share`, {
            method: "POST",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify({ userId })
        })
        if (!res.ok) throw new Error("Error compartiendo snippet")
        return res.json()
    }

    async getFormatRules(): Promise<Rule[]> {
        const res = await fetch(`${BASE_URL}/rules/format`, { headers: await authHeaders(this.getToken) })
        if (!res.ok) throw new Error("Error obteniendo reglas de formato")
        return res.json()
    }

    async getLintingRules(): Promise<Rule[]> {
        const res = await fetch(`${BASE_URL}/rules/lint`, { headers: await authHeaders(this.getToken) })
        if (!res.ok) throw new Error("Error obteniendo reglas de lint")
        return res.json()
    }

    async formatSnippet(snippet: string): Promise<string> {
        const res = await fetch(`${BASE_URL}/snippets/format`, {
            method: "POST",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify({ content: snippet })
        })
        if (!res.ok) throw new Error("Error formateando snippet")
        const data = await res.json()
        return data.formatted ?? data.content
    }

    async getTestCases(): Promise<TestCase[]> {
        const res = await fetch(`${BASE_URL}/tests`, { headers: await authHeaders(this.getToken) })
        if (!res.ok) throw new Error("Error obteniendo test cases")
        return res.json()
    }

    async postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        const res = await fetch(`${BASE_URL}/tests`, {
            method: "POST",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(testCase)
        })
        if (!res.ok) throw new Error("Error creando test case")
        return res.json()
    }

    async removeTestCase(id: string): Promise<string> {
        const res = await fetch(`${BASE_URL}/tests/${id}`, {
            method: "DELETE",
            headers: await authHeaders(this.getToken)
        })
        if (!res.ok) throw new Error("Error eliminando test case")
        return id
    }

    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        const res = await fetch(`${BASE_URL}/tests/run`, {
            method: "POST",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(testCase)
        })
        if (!res.ok) throw new Error("Error ejecutando test")
        const data = await res.json()
        return data.result as TestCaseResult
    }

    async deleteSnippet(id: string): Promise<string> {
        const res = await fetch(`${BASE_URL}/snippets/${id}`, {
            method: "DELETE",
            headers: await authHeaders(this.getToken)
        })
        if (!res.ok) throw new Error("Error eliminando snippet")
        return id
    }

    async getFileTypes(): Promise<FileType[]> {
        const res = await fetch(`${BASE_URL}/file-types`, { headers: await authHeaders(this.getToken) })
        if (!res.ok) throw new Error("Error obteniendo tipos de archivo")
        return res.json()
    }

    async modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        const res = await fetch(`${BASE_URL}/rules/format`, {
            method: "PUT",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(newRules)
        })
        if (!res.ok) throw new Error("Error modificando reglas de formato")
        return res.json()
    }

    async modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        const res = await fetch(`${BASE_URL}/rules/lint`, {
            method: "PUT",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(newRules)
        })
        if (!res.ok) throw new Error("Error modificando reglas de lint")
        return res.json()
    }
}
