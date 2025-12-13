import {Snippet} from "../utils/snippet";

export type SnippetRelation = 'OWNER' | 'SHARED';

export type SnippetLintError = {
  rule: string;
  message: string;
  severity: "ERROR" | "WARNING";
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
};

export type SnippetTest = {
  id: string;
  name: string;
  description?: string | null;
  input?: string[];
  expectedOutput: string;
  lastRunAt?: string | null;
  lastRunExitCode?: number | null;
  lastRunOutput?: string | null;
  lastRunError?: string | null;
};

export type SnippetTestExecution = {
  id: string;
  passed: boolean;
  exitCode: number;
  stdout?: string | null;
  stderr?: string | null;
  lastRunAt?: string | null;
};

export type SnippetDetails = Snippet & {
  description?: string;
  version?: string;
  extension?: string;
  relation?: SnippetRelation;
  complianceMessage?: string | null;
  lintErrors?: SnippetLintError[];
  tests?: SnippetTest[];
  content?: string;
  author?: string;
};

export type SnippetListFilters = {
  name?: string;
  language?: string;
  valid?: boolean | null;
  relation?: 'all' | 'owned' | 'shared';
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

export type FormatSnippetPayload = {
  content: string;
  language: string;
  version: string;
  check?: boolean;
};

export type AnalyzeIssue = SnippetLintError;

export type AnalyzeResponse = {
  issues: AnalyzeIssue[];
  raw?: string;
};
