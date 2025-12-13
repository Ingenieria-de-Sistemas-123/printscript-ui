import {useEffect, useState} from "react";
import {Alert, Box, Button, Stack, TextField, Typography} from "@mui/material";
import {TestCase} from "../../types/TestCase.ts";
import {SnippetTestExecution} from "../../types/snippetDetails.ts";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {BugReport} from "@mui/icons-material";

type TabPanelProps = {
    index: number;
    value: number;
    test?: TestCase;
    setTestCase: (testCase: Partial<TestCase>) => Promise<TestCase>;
    removeTestCase?: (id: string) => Promise<string>;
    onExecute?: () => Promise<void>;
    execution?: SnippetTestExecution;
    isExecuting?: boolean;
}

export const TabPanel = ({value, index, test, setTestCase, removeTestCase, onExecute, execution, isExecuting}: TabPanelProps) => {
    const isActive = value === index;
    const {createSnackbar} = useSnackbarContext();
    const [name, setName] = useState(test?.name ?? "");
    const [input, setInput] = useState(test?.input?.join("\n") ?? "");
    const [output, setOutput] = useState(test?.output?.join("\n") ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setName(test?.name ?? "");
        setInput(test?.input?.join("\n") ?? "");
        setOutput(test?.output?.join("\n") ?? "");
    }, [test]);

    const parseLines = (value: string): string[] | undefined => {
        const lines = value
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);
        return lines.length ? lines : undefined;
    };

    const handleSave = async () => {
        if (!name.trim()) {
            createSnackbar('error', "El nombre es obligatorio");
            return;
        }
        setIsSaving(true);
        try {
            await setTestCase({
                id: test?.id,
                name: name.trim(),
                input: parseLines(input),
                output: parseLines(output)
            });
            createSnackbar('success', test ? "Test actualizado" : "Test creado");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error guardando test";
            createSnackbar('error', message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!test?.id || !removeTestCase) return;
        setIsDeleting(true);
        try {
            await removeTestCase(test.id);
            createSnackbar('success', "Test eliminado");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error eliminando test";
            createSnackbar('error', message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExecute = async () => {
        if (!onExecute) return;
        try {
            await onExecute();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error ejecutando test";
            createSnackbar('error', message);
        }
    };

    return (
        <div
            role="tabpanel"
            hidden={!isActive}
            id={`snippet-test-tabpanel-${index}`}
            aria-labelledby={`snippet-test-tab-${index}`}
            style={{width: '100%', height: '100%'}}
        >
            {isActive && (
                <Box sx={{px: 3, minWidth: 360}} display="flex" flexDirection="column" gap={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {test ? "Editar test" : "Nuevo test"}
                    </Typography>
                    <TextField
                        label="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Entradas (una por línea)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                    <TextField
                        label="Salidas esperadas (una por línea)"
                        value={output}
                        onChange={(e) => setOutput(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving || !name.trim()}
                        >
                            {test ? "Guardar" : "Crear"}
                        </Button>
                        {test?.id && removeTestCase && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDelete}
                                disabled={isDeleting || isSaving}
                            >
                                Eliminar
                            </Button>
                        )}
                        {test?.id && onExecute && (
                            <Button
                                variant="outlined"
                                onClick={handleExecute}
                                disabled={isExecuting}
                                startIcon={<BugReport/>}
                            >
                                Ejecutar test
                            </Button>
                        )}
                    </Stack>
                    {execution && (
                        <Alert severity={execution.passed ? "success" : "error"}>
                            <Typography fontWeight="bold" mb={1}>
                                Resultado: {execution.passed ? "OK" : "Error"} (exit {execution.exitCode})
                            </Typography>
                            {execution.stdout && (
                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                                    STDOUT {"\n"}{execution.stdout}
                                </Typography>
                            )}
                            {execution.stderr && (
                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap', mt: 1}}>
                                    STDERR {"\n"}{execution.stderr}
                                </Typography>
                            )}
                        </Alert>
                    )}
                </Box>
            )}
        </div>
    );
}
