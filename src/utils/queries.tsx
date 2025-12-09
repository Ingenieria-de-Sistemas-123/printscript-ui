import { useMutation, UseMutationResult, useQuery } from "react-query";
import { CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet } from "./snippet.ts";
import { PaginatedUsers } from "./users.ts";
import { FileType } from "../types/FileType.ts";
import { RealSnippetOperations } from "./impl/realSnippetOperations.ts";
import { Rule } from "../types/Rule.ts";
import { useAuth0 } from "@auth0/auth0-react";
import {
    FormatSnippetPayload,
    SnippetDetails,
    //SnippetListFilters,
    SnippetTestExecution
} from "../types/snippetDetails.ts";
import { TestCase } from "../types/TestCase.ts";

export type TestCaseResult = "success" | "fail";

export const useSnippetsOperations = () => {
    const { getAccessTokenSilently } = useAuth0();
    const getToken = async () => {
        try {
            return await getAccessTokenSilently();
        } catch {
            return undefined;
        }
    };
    return new RealSnippetOperations(getToken);
};

/*type PaginatedSnippetDetails = Omit<PaginatedSnippets, "snippets"> & { snippets: SnippetDetails[] };

export const useGetSnippets = (
    page: number = 0,
    pageSize: number = 10,
    filters?: SnippetListFilters
) => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<PaginatedSnippetDetails, Error>(
        ["listSnippets", page, pageSize, filters],
        async () => {
            const serializedFilters = filters ? JSON.stringify(filters) : undefined;
            const response = await snippetOperations.listSnippetDescriptors(page, pageSize, serializedFilters);
            return response as PaginatedSnippetDetails;
        }
    );
};*/

export const useGetSnippets = (page: number = 0, pageSize: number = 10, snippetName?: string) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<PaginatedSnippets, Error>(['listSnippets', page,pageSize,snippetName], () => snippetOperations.listSnippetDescriptors(page, pageSize,snippetName));
};

export const useGetSnippetById = (id: string) => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<SnippetDetails | undefined, Error>(
        ["snippet", id],
        async () => {
            const snippet = await snippetOperations.getSnippetById(id);
            return snippet as SnippetDetails | undefined;
        },
        { enabled: !!id }
    );
};

export const useCreateSnippet = ({ onSuccess, onError }: { onSuccess: () => void; onError?: (error: Error) => void }): UseMutationResult<
    Snippet,
    Error,
    CreateSnippet
> => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Snippet, Error, CreateSnippet>(
        (createSnippet) => snippetOperations.createSnippet(createSnippet),
        { onSuccess, onError }
    );
};

export const useUpdateSnippetById = ({
                                         onSuccess,
                                         onError,
                                     }: {
    onSuccess: () => void;
    onError?: (error: Error) => void;
}): UseMutationResult<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }> => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({ id, updateSnippet }) => snippetOperations.updateSnippetById(id, updateSnippet),
        { onSuccess, onError }
    );
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<PaginatedUsers, Error>(
        ["users", name, page, pageSize],
        () => snippetOperations.getUserFriends(name, page, pageSize)
    );
};

export const useShareSnippet = () => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Snippet, Error, { snippetId: string; userId: string }>(
        ({ snippetId, userId }) => snippetOperations.shareSnippet(snippetId, userId)
    );
};

export const useGetFormatRules = () => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<Rule[], Error>("formatRules", () => snippetOperations.getFormatRules());
};

export const useModifyFormatRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Rule[], Error, Rule[]>((rule) => snippetOperations.modifyFormatRule(rule), { onSuccess });
};

export const useGetLintingRules = () => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<Rule[], Error>("lintingRules", () => snippetOperations.getLintingRules());
};

export const useModifyLintingRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Rule[], Error, Rule[]>((rule) => snippetOperations.modifyLintingRule(rule), { onSuccess });
};

export const useFormatSnippet = () => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<string, Error, FormatSnippetPayload>((snippetContent) =>
        snippetOperations.formatSnippet(JSON.stringify(snippetContent))
    );
};

export const useDeleteSnippet = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<string, Error, string>((id) => snippetOperations.deleteSnippet(id), { onSuccess });
};

export const useGetFileTypes = () => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<FileType[], Error>("fileTypes", () => snippetOperations.getFileTypes());
};

export const useGetTestCases = () => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<TestCase[], Error>("testCases", () => snippetOperations.getTestCases());
};

export const usePostTestCase = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<TestCase, Error, Partial<TestCase>>(
        (testCase) => snippetOperations.postTestCase(testCase),
        { onSuccess }
    );
};

export const useRemoveTestCase = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<string, Error, string>((id) => snippetOperations.removeTestCase(id), { onSuccess });
};

export const useTestSnippet = () => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<TestCaseResult, Error, Partial<TestCase>>((testCase) => snippetOperations.testSnippet(testCase));
};

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080/api";

export const useExecuteSnippetTest = () => {
    const { getAccessTokenSilently } = useAuth0();
    return useMutation<SnippetTestExecution, Error, { snippetId: string; testId: string }>(async ({ snippetId, testId }) => {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${BASE_URL}/snippets/${snippetId}/tests/${testId}/execute`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(body || "Error ejecutando el test del snippet");
        }
        return res.json();
    });
};
