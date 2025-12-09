import {Pagination} from "./pagination.ts";
import {FileType} from "../types/FileType.ts";

export type ComplianceEnum =
    'pending' |
    'failed' |
    'not-compliant' |
    'compliant'


export type CreateSnippet = {
    name: string;
    content: string;
    language: string;
    extension: string;
}

export type CreateSnippetWithLang = CreateSnippet & { language: string }

export type UpdateSnippet = {
    name: string;
    language: string;
    content: string;
    description?: string;
    version?: string;
    extension?: string;
}

export type Snippet = CreateSnippet & {
    id: string
} & SnippetStatus

type SnippetStatus = {
    compliance: ComplianceEnum;
    author: string;
}
export type PaginatedSnippets = Pagination & {
    snippets: Snippet[]
}

export const getFileLanguage = (fileTypes: FileType[], fileExt?: string) => {
    return fileExt && fileTypes?.find(x => x.extension == fileExt)
}

const FALLBACK_LANGUAGE_VERSIONS: Record<string, string[]> = {
    printscript: ["1.0"],
}

const normalizeLanguage = (value?: string) => value?.toLowerCase() ?? ""

export const getLanguageVersions = (fileTypes: FileType[] = [], language?: string): string[] => {
    if (!language) return []
    const normalized = normalizeLanguage(language)
    const fileType = fileTypes.find(type => normalizeLanguage(type.language) === normalized)
    if (fileType?.versions?.length) return fileType.versions
    if (fileType?.defaultVersion) return [fileType.defaultVersion]
    return FALLBACK_LANGUAGE_VERSIONS[normalized] ?? []
}

export const getDefaultLanguageVersion = (fileTypes: FileType[] = [], language?: string): string | undefined => {
    if (!language) return undefined
    const normalized = normalizeLanguage(language)
    const fileType = fileTypes.find(type => normalizeLanguage(type.language) === normalized)
    return fileType?.defaultVersion ?? getLanguageVersions(fileTypes, language)[0]
}

export const isLanguageVersionRequired = (fileTypes: FileType[] = [], language?: string): boolean => {
    return getLanguageVersions(fileTypes, language).length > 0
}
