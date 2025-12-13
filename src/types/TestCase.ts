export type TestCase = {
  id: string;
  name: string;
  description?: string;
  input?: string[];
  expectedOutput: string;
  lastRunExitCode?: number;
  lastRunOutput?: string;
  lastRunError?: string;
  lastRunAt?: string;
};
