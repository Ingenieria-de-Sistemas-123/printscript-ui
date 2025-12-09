// src/utils/impl/realSnippetOperations.ts
import {SnippetOperations} from '../snippetOperations'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import {PaginatedUsers} from "../users"
import {TestCase} from "../../types/TestCase"
import {TestCaseResult} from "../queries"
import {FileType} from "../../types/FileType"
import {Rule} from "../../types/Rule"
import {FormatSnippetPayload, SnippetDetails, SnippetListFilters} from "../../types/snippetDetails";

type TokenGetter = () => Promise<string | undefined>
const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080/api"

async function authHeaders(getToken?: TokenGetter, includeContentType = true) {
    const headers: Record<string,string> = {}
    if (includeContentType) {
        headers["Content-Type"] = "application/json"
    }
    if (getToken) {
        const token = await getToken()
        if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return headers
}

const mapCompliance = (status?: string | null): Snippet["compliance"] => {
    switch (status) {
        case "VALID":
            return "compliant"
        case "INVALID":
            return "not-compliant"
        default:
            return "pending"
    }
}

const mapSnippetResponse = (payload: any): SnippetDetails => ({
    id: payload.id,
    name: payload.name,
    description: payload.description,
    content: payload.content,
    language: payload.language,
    version: payload.version,
    extension: payload.extension,
    compliance: mapCompliance(payload.complianceStatus ?? payload.compliance),
    complianceMessage: payload.complianceMessage,
    author: payload.ownerName ?? payload.author ?? "Unknown",
    relation: payload.relation ?? payload.permission ?? undefined,
    lintErrors: payload.lintErrors ?? [],
    tests: payload.tests ?? [],
})

const mapPaginatedResponse = (data: any): PaginatedSnippets => {
    const items = data.items ?? data.snippets ?? []
    const snippets: Snippet[] = items.map(mapSnippetResponse)
    return {
        page: data.page ?? data.page_number ?? 0,
        page_size: data.pageSize ?? data.page_size ?? data.size ?? snippets.length,
        count: data.totalElements ?? data.total ?? data.count ?? snippets.length,
        snippets,
    }
}

const parseFilters = (raw?: string): SnippetListFilters | undefined => {
    if (!raw) return undefined
    try {
        return JSON.parse(raw)
    } catch {
        return { name: raw }
    }
}

export class RealSnippetOperations implements SnippetOperations {
    constructor(private getToken?: TokenGetter) {}

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> {
        const q = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
        const filters = parseFilters(snippetName)
        if (filters?.name) q.set("name", filters.name)
        if (filters?.language) q.set("language", filters.language)
        if (typeof filters?.valid === "boolean") q.set("valid", String(filters.valid))
        if (filters?.relation) q.set("relation", filters.relation)
        if (filters?.sortBy) q.set("sort_by", filters.sortBy)
        if (filters?.sortDir) q.set("sort_dir", filters.sortDir)

        const res = await fetch(`${BASE_URL}/snippets?${q.toString()}`, {
            headers: await authHeaders(this.getToken)
        })
        if (!res.ok) throw new Error("Error listando snippets")
        const data = await res.json()
        return mapPaginatedResponse(data)
    }

    async createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        const payload = createSnippet as CreateSnippet & { description?: string; version?: string }
        const fileBlob = new Blob([createSnippet.content], { type: 'text/plain' })
        const fileName = `${createSnippet.name}.${createSnippet.extension}`
        const formData = new FormData()
        formData.append('file', fileBlob, fileName)

        const requestData: Record<string, string> = {
            name: createSnippet.name,
            language: createSnippet.language,
        }
        if (payload.description) requestData.description = payload.description
        if (payload.version) requestData.version = payload.version
        const requestBlob = new Blob([JSON.stringify(requestData)], {
            type: 'application/json'
        })
        formData.append('request', requestBlob)

        const headers = await authHeaders(this.getToken, false)
        delete headers["Content-Type"]

        const res = await fetch(`${BASE_URL}/snippets`, {
            method: "POST",
            headers,
            body: formData
        })

        if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`Error creando snippet: ${res.status} - ${errorText}`)
        }

        const data = await res.json()
        return mapSnippetResponse(data)
    }

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        const res = await fetch(`${BASE_URL}/snippets/${id}`, {
            headers: await authHeaders(this.getToken)
        })
        if (res.status === 404) return undefined
        if (!res.ok) throw new Error("Error obteniendo snippet")
        const data = await res.json()
        return mapSnippetResponse(data)
    }

    async updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        const payload = updateSnippet
        if (!payload.name || !payload.language) {
            throw new Error("Nombre y lenguaje son obligatorios para actualizar un snippet.")
        }

        const formData = new FormData()

        const extension = (payload.extension ?? 'prs').replace(/^\./, '')
        const fileNameBase = payload.name.trim()
        const fileBlob = new Blob([updateSnippet.content], { type: 'text/plain' })
        formData.append('file', fileBlob, `${fileNameBase}.${extension}`)

        const requestPayload: Record<string, string> = {
            name: payload.name,
            language: payload.language,
        }
        if (payload.description) requestPayload.description = payload.description
        if (payload.version) requestPayload.version = payload.version

        formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }))

        const headers = await authHeaders(this.getToken, false)
        delete headers["Content-Type"]

        const res = await fetch(`${BASE_URL}/snippets/${id}`, {
            method: "PUT",
            headers,
            body: formData
        })
        if (!res.ok) throw new Error("Error actualizando snippet")
        const data = await res.json()
        return mapSnippetResponse(data)
    }

    async getUserFriends(name: string = "", page: number = 0, pageSize: number = 10): Promise<PaginatedUsers> {
        const q = new URLSearchParams({ name, page: String(page), page_size: String(pageSize) })
        const res = await fetch(`${BASE_URL}/users?${q.toString()}`, {
            headers: await authHeaders(this.getToken)
        })
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
        const res = await fetch(`${BASE_URL}/rules/format`, {
            headers: await authHeaders(this.getToken)
        })
        if (!res.ok) throw new Error("Error obteniendo reglas de formato")
        return res.json()
    }

    async getLintingRules(): Promise<Rule[]> {
        const res = await fetch(`${BASE_URL}/rules/lint`, {
            headers: await authHeaders(this.getToken)
        })
        if (!res.ok) throw new Error("Error obteniendo reglas de lint")
        return res.json()
    }

    async formatSnippet(snippet: string): Promise<string> {
        let payload: FormatSnippetPayload
        try {
            payload = JSON.parse(snippet)
        } catch {
            throw new Error("Formato inválido para el request de formateo.")
        }
        if (!payload.language || !payload.version) {
            throw new Error("Lenguaje y versión son obligatorios para formatear un snippet.")
        }
        const res = await fetch(`${BASE_URL}/snippets/format`, {
            method: "POST",
            headers: await authHeaders(this.getToken),
            body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Error formateando snippet")
        const data = await res.json()
        return data.formatted ?? data.content
    }

    async getTestCases(): Promise<TestCase[]> {
        const res = await fetch(`${BASE_URL}/tests`, {
            headers: await authHeaders(this.getToken)
        })
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
        const res = await fetch(`${BASE_URL}/file-types`, {
            headers: await authHeaders(this.getToken)
        })
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
