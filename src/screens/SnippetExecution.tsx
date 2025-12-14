import {Box, Button, TextField, Tooltip} from "@mui/material";
import { useState } from "react";
import { Bòx } from "../components/snippet-table/SnippetBox";
import { useExecuteSnippet } from "../utils/queries";

type SnippetExecutionProps = {
    snippetId: string;
    disabled?: boolean;
    disabledReason?: string;
};

export const SnippetExecution = ({ snippetId, disabled, disabledReason }: SnippetExecutionProps) => {
    const [input, setInput] = useState("");

    const {
        mutate: runSnippet,
        data,
        error,
        isLoading: running,
    } = useExecuteSnippet(snippetId);

    const run = () => {
        if (disabled) return;
        runSnippet({ input });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            run();
        }
    };


    const stdout = data?.stdout ?? "";
    const stderr = error?.message ?? data?.stderr ?? "";

    const outputToShow = (disabled && !stderr && !stdout)
        ? (disabledReason ?? "Guardá los cambios antes de ejecutar.")
        : (stderr && stderr.trim().length > 0 ? stderr : stdout);

    return (
        <>
            <Bòx
                flex={1}
                overflow={"none"}
                minHeight={200}
                bgcolor={"black"}
                color={"white"}
                code={outputToShow}
            >
        <pre style={{ margin: 0, padding: 10, whiteSpace: "pre-wrap" }}>
          {outputToShow}
        </pre>
            </Bòx>

            <Box mt={1} display="flex" gap={1}>
                <TextField
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={"Inputs (una línea por cada readInput())"}
                    fullWidth
                    multiline
                    minRows={2}
                    onKeyDown={handleKeyDown}
                />
                <Tooltip title={disabled ? (disabledReason ?? "Guardá los cambios antes de ejecutar.") : ""}>
                    <span>
                        <Button variant="contained" disabled={running || !!disabled} onClick={run}>
                            Run
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </>
    );
};
