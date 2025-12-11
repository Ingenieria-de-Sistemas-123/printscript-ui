import {useState} from "react";
import {Box, Button, OutlinedInput} from "@mui/material";
import {Bòx} from "../components/snippet-table/SnippetBox";

type SnippetExecutionProps = {
    snippetId: string;
};

export const SnippetExecution = ({snippetId}: SnippetExecutionProps) => {
    const [input, setInput] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [errorOutput, setErrorOutput] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);

    const runSnippet = async () => {
        try {
            setIsRunning(true);
            setOutput("");
            setErrorOutput("");

            const res = await fetch(`/api/snippets/${snippetId}/execute`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({input}),
            });

            if (!res.ok) {
                const text = await res.text();
                setErrorOutput(`HTTP ${res.status}: ${text}`);
                return;
            }

            const data: { exitCode: number; stdout: string; stderr: string } = await res.json();
            setOutput(data.stdout ?? "");
            if (data.stderr) setErrorOutput(data.stderr);
        } catch (e: unknown) {
            const err = e as Error;
            setErrorOutput(err.message ?? "Error ejecutando snippet");
        } finally {
            setIsRunning(false);
        }
    };

    const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void runSnippet();
        }
    };

    const codeToShow: string = errorOutput || output || "";

    return (
        <>
            <Bòx
                flex={1}
                overflow={"none"}
                minHeight={200}
                bgcolor={"black"}
                color={"white"}
                code={codeToShow}
            >
                {/* si querés mostrarlo como texto simple */}
                {/* <pre>{codeToShow}</pre> */}
            </Bòx>
            <Box mt={1} display="flex" gap={1}>
                <OutlinedInput
                    onKeyDown={handleEnter}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Inputs"
                    fullWidth
                />
                <Button variant="contained" disabled={isRunning} onClick={runSnippet}>
                    Run
                </Button>
            </Box>
        </>
    );
};
