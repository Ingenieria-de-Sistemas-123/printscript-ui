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
    SnippetListFilters,
    SnippetTestExecution,
} from "../types/snippetDetails.ts";

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

type PaginatedSnippetDetails = Omit<PaginatedSnippets, "snippets"> & { snippets: SnippetDetails[] };

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
            const response = await snippetOperations.listSnippetDescriptors(
                page,
                pageSize,
                serializedFilters
            );
            return response as PaginatedSnippetDetails;
        }
    );
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

export const useCreateSnippet = ({
                                     onSuccess,
                                 }: {
    onSuccess: () => void;
}): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Snippet, Error, CreateSnippet>(
        (createSnippet) => snippetOperations.createSnippet(createSnippet),
        { onSuccess }
    );
};

export const useUpdateSnippetById = ({
                                         onSuccess,
                                     }: {
    onSuccess: () => void;
}): UseMutationResult<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }> => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({ id, updateSnippet }) => snippetOperations.updateSnippetById(id, updateSnippet),
        { onSuccess }
    );
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<PaginatedUsers, Error>(["users", name, page, pageSize], () =>
        snippetOperations.getUserFriends(name, page, pageSize)
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
    return useMutation<Rule[], Error, Rule[]>(
        (rules) => snippetOperations.modifyFormatRule(rules),
        { onSuccess }
    );
};

export const useGetLintingRules = () => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<Rule[], Error>("lintingRules", () => snippetOperations.getLintingRules());
};

export const useModifyLintingRules = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<Rule[], Error, Rule[]>(
        (rules) => snippetOperations.modifyLintingRule(rules),
        { onSuccess }
    );
};

export const useFormatSnippet = () => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<string, Error, FormatSnippetPayload>((snippetContent) =>
        snippetOperations.formatSnippet(snippetContent)
    );
};

export const useDeleteSnippet = ({ onSuccess }: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<string, Error, string>((id) => snippetOperations.deleteSnippet(id), {
        onSuccess,
    });
};

export const useGetFileTypes = () => {
    const snippetOperations = useSnippetsOperations();
    return useQuery<FileType[], Error>("fileTypes", () => snippetOperations.getFileTypes());
};

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080/api";

export const useExecuteSnippetTest = () => {
    const { getAccessTokenSilently } = useAuth0();
    return useMutation<SnippetTestExecution, Error, { snippetId: string; testId: string }>(
        async ({ snippetId, testId }) => {
            const token = await getAccessTokenSilently();
            const res = await fetch(
                `${BASE_URL}/snippets/${snippetId}/tests/${testId}/execute`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) {
                const body = await res.text();
                throw new Error(body || "Error ejecutando el test del snippet");
            }
            return res.json();
        }
    );
};

export const useFormatAllSnippets = () => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<void, Error, void>(() => snippetOperations.formatAllSnippets());
};

export const useLintAllSnippets = () => {
    const snippetOperations = useSnippetsOperations();
    return useMutation<void, Error, void>(() => snippetOperations.lintAllSnippets());
};
