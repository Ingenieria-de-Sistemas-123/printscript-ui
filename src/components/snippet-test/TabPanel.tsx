import {useEffect, useMemo, useState} from "react";
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
    const [input, setInput] = useState(
        Array.isArray(test?.input) ? test?.input?.join("\n") ?? "" : test?.input ?? ""
    );
    const [expectedOutput, setExpectedOutput] = useState(test?.expectedOutput ?? "");
    const [description, setDescription] = useState(test?.description ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setName(test?.name ?? "");
        setInput(Array.isArray(test?.input) ? test?.input?.join("\n") ?? "" : test?.input ?? "");
        setExpectedOutput(test?.expectedOutput ?? "");
        setDescription(test?.description ?? "");
    }, [test]);

    const handleSave = async () => {
        if (!name.trim()) {
            createSnackbar('error', "El nombre es obligatorio");
            return;
        }
        if (!expectedOutput.trim()) {
            createSnackbar('error', "La salida esperada es obligatoria");
            return;
        }
        setIsSaving(true);
        try {
            const sanitizedInput = input.trim() ? input.trim() : undefined;
            await setTestCase({
                id: test?.id,
                name: name.trim(),
                input: sanitizedInput,
                expectedOutput: expectedOutput.trim(),
                description: description.trim() || undefined,
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

    const latestExecution = useMemo<SnippetTestExecution | undefined>(() => {
        if (execution) return execution;
        if (!test?.id || typeof test.lastRunExitCode === "undefined") return undefined;
        const expected = (test.expectedOutput ?? "").trim();
        const stdout = (test.lastRunOutput ?? "").trim();
        const passed = test.lastRunExitCode === 0 && expected === stdout;
        return {
            id: test.id,
            passed,
            exitCode: test.lastRunExitCode ?? 1,
            stdout: test.lastRunOutput,
            stderr: test.lastRunError,
            lastRunAt: test.lastRunAt ?? null,
        };
    }, [execution, test]);

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
                        label="Descripción (opcional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
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
                        label="Salida esperada"
                        value={expectedOutput}
                        onChange={(e) => setExpectedOutput(e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                        required
                    />
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving || !name.trim() || !expectedOutput.trim()}
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
                    {latestExecution && (
                        <Alert severity={latestExecution.passed ? "success" : "error"}>
                            <Typography fontWeight="bold" mb={1}>
                                Resultado: {latestExecution.passed ? "OK" : "Error"} (exit {latestExecution.exitCode})
                            </Typography>
                            <Typography variant="body2" mb={1}>
                                Esperado: {test?.expectedOutput ?? expectedOutput}
                            </Typography>
                            {latestExecution.lastRunAt && (
                                <Typography variant="caption" display="block" color="text.secondary" mb={1}>
                                    Última ejecución: {latestExecution.lastRunAt}
                                </Typography>
                            )}
                            <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                                STDOUT {"\n"}{latestExecution.stdout ?? "—"}
                            </Typography>
                            {latestExecution.stderr && (
                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap', mt: 1}}>
                                    STDERR {"\n"}{latestExecution.stderr}
                                </Typography>
                            )}
                        </Alert>
                    )}
                </Box>
            )}
        </div>
    );
}
