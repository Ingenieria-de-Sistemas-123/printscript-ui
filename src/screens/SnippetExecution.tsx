import {Box, Button, TextField} from "@mui/material";
import { useState } from "react";
import { Bòx } from "../components/snippet-table/SnippetBox";
import { useExecuteSnippet } from "../utils/queries";

type SnippetExecutionProps = {
    snippetId: string;
};

export const SnippetExecution = ({ snippetId }: SnippetExecutionProps) => {
    const [input, setInput] = useState("");

    const {
        mutate: runSnippet,
        data,
        error,
        isLoading: running,
    } = useExecuteSnippet(snippetId);

    const run = () => {
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

    const outputToShow = stderr && stderr.trim().length > 0 ? stderr : stdout;

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
                <Button variant="contained" disabled={running} onClick={run}>
                    Run
                </Button>
            </Box>
        </>
    );
};
