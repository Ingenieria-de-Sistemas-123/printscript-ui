import {SnippetOperations} from '../snippetOperations'
import {FakeSnippetStore} from './fakeSnippetStore'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import autoBind from 'auto-bind'
import {Friends} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";
import {FormatSnippetPayload, SnippetTestExecution} from "../../types/snippetDetails.ts";
const DELAY: number = 1000

export class FakeSnippetOperations implements SnippetOperations {
    private readonly fakeStore = new FakeSnippetStore()

    constructor() {
        autoBind(this)
    }

    createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.createSnippet(createSnippet)), DELAY)
        })
    }

    getSnippetById(id: string): Promise<Snippet | undefined> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getSnippetById(id)), DELAY)
        })
    }

    listSnippetDescriptors(page: number,pageSize: number): Promise<PaginatedSnippets> {
        const response: PaginatedSnippets = {
            page: page,
            page_size: pageSize,
            count: 20,
            snippets: page == 0 ? this.fakeStore.listSnippetDescriptors().splice(0,pageSize) : this.fakeStore.listSnippetDescriptors().splice(1,2)
        }

        return new Promise(resolve => {
            setTimeout(() => resolve(response), DELAY)
        })
    }

    updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.updateSnippet(id, updateSnippet)), DELAY)
        })
    }

  getUserFriends(): Promise<Friends[]>{
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getUserFriends()), DELAY)
    })
  }

    shareSnippet(snippetId: string): Promise<Snippet> {
        return new Promise(resolve => {
            // @ts-expect-error, it will always find it in the fake store
            setTimeout(() => resolve(this.fakeStore.getSnippetById(snippetId)), DELAY)
        })
    }

    getFormatRules(): Promise<Rule[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getFormatRules()), DELAY)
        })
    }

    getLintingRules(): Promise<Rule[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getLintingRules()), DELAY)
        })
    }

  formatSnippet(payload: FormatSnippetPayload): Promise<string> {
    return new Promise(resolve => {
      setTimeout(
          () => resolve(this.fakeStore.formatSnippet(payload.content)),
          DELAY
      );
    });
  }

    getSnippetTests(snippetId: string): Promise<TestCase[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getTestCases(snippetId)), DELAY)
        })
    }

    saveSnippetTest(snippetId: string, testCase: TestCase): Promise<TestCase> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.upsertTestCase(snippetId, testCase)), DELAY)
        })
    }

    removeSnippetTest(snippetId: string, id: string): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.removeTestCase(snippetId, id)), DELAY)
        })
    }

    executeSnippetTest(snippetId: string, testId: string): Promise<SnippetTestExecution> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.executeSnippetTest(snippetId, testId)), DELAY)
        })
    }

    deleteSnippet(id: string): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.deleteSnippet(id)), DELAY)
        })
    }

    getFileTypes(): Promise<FileType[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.getFileTypes()), DELAY)
        })
    }

    modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve(this.fakeStore.modifyFormattingRule(newRules)), DELAY)
        })
    }

  modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.modifyLintingRule(newRules)), DELAY)
    })
  }

  formatAllSnippets(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), DELAY);
    });
  }

  lintAllSnippets(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), DELAY);
    });
  }
}
