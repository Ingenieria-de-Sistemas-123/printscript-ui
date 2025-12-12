import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet'
import {Friends} from "./users.ts";
import {TestCase} from "../types/TestCase.ts";
import {SnippetTestExecution} from "../types/snippetDetails.ts";
import {FileType} from "../types/FileType.ts";
import {Rule} from "../types/Rule.ts";
import {FormatSnippetPayload} from "../types/snippetDetails.ts";

export interface SnippetOperations {
    listSnippetDescriptors(page: number,pageSize: number,sippetName?: string): Promise<PaginatedSnippets>

    createSnippet(createSnippet: CreateSnippet): Promise<Snippet>

    getSnippetById(id: string): Promise<Snippet | undefined>

    updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet>

  getUserFriends(): Promise<Friends[]>

    shareSnippet(snippetId: string,userId: string): Promise<Snippet>

    getFormatRules(): Promise<Rule[]>

    getLintingRules(): Promise<Rule[]>

    getSnippetTests(snippetId: string): Promise<TestCase[]>

    formatSnippet(payload: FormatSnippetPayload): Promise<string>;

    saveSnippetTest(snippetId: string, testCase: Partial<TestCase>): Promise<TestCase>

    removeSnippetTest(snippetId: string, id: string): Promise<string>

    deleteSnippet(id: string): Promise<string>

    executeSnippetTest(snippetId: string, testId: string): Promise<SnippetTestExecution>

    getFileTypes(): Promise<FileType[]>

    modifyFormatRule(newRules: Rule[]): Promise<Rule[]>

  modifyLintingRule(newRules: Rule[]): Promise<Rule[]>

  formatAllSnippets(): Promise<void>;

  lintAllSnippets(): Promise<void>;
}
