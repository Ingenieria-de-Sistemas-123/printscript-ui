import {Alert, Box, CircularProgress, Divider, IconButton, Tab, Tabs, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {SyntheticEvent, useEffect, useMemo, useState} from "react";
import {AddRounded} from "@mui/icons-material";
import {
    useExecuteSnippetTest,
    useGetTestCases,
    usePostTestCase,
    useRemoveTestCase
} from "../../utils/queries.tsx";
import {TabPanel} from "./TabPanel.tsx";
import {queryClient} from "../../App.tsx";
import {SnippetTestExecution} from "../../types/snippetDetails.ts";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {TestCase} from "../../types/TestCase.ts";

type TestSnippetModalProps = {
    open: boolean;
    onClose: () => void;
    snippetId?: string;
}

export const TestSnippetModal = ({open, onClose, snippetId}: TestSnippetModalProps) => {
    const [value, setValue] = useState(0);
    const [executions, setExecutions] = useState<Record<string, SnippetTestExecution>>({});
    const {createSnackbar} = useSnackbarContext();

    const isReady = !!snippetId;
    const {data: testCases, isLoading: loadingTests} = useGetTestCases(snippetId);
    const {mutateAsync: postTestCase} = usePostTestCase(snippetId ?? "", {
        onSuccess: () => queryClient.invalidateQueries(['testCases', snippetId])
    });
    const {mutateAsync: removeTestCase} = useRemoveTestCase(snippetId ?? "", {
        onSuccess: () => queryClient.invalidateQueries(['testCases', snippetId])
    });
    const {mutateAsync: executeTest, isLoading: runningTest} = useExecuteSnippetTest(snippetId ?? "");

    useEffect(() => {
        if (!open) {
            setValue(0);
            setExecutions({});
        }
    }, [open]);

    useEffect(() => {
        setExecutions({});
        setValue(0);
    }, [snippetId]);

    const tests: TestCase[] = useMemo(() => testCases ?? [], [testCases]);
    const creationIndex = tests.length;

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleExecute = async (testId: string) => {
        if (!snippetId) return;
        try {
            const result = await executeTest(testId);
            setExecutions(prev => ({...prev, [testId]: result}));
            queryClient.invalidateQueries(['testCases', snippetId]);
            createSnackbar('success', "Test ejecutado");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error ejecutando test";
            createSnackbar('error', message);
        }
    };

    const handleAddTab = () => setValue(creationIndex);

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"} fontWeight="bold">Tests del snippet</Typography>
            <Typography variant="body2" color="text.secondary">
                Configurá casos de prueba y ejecútalos para validar el snippet.
            </Typography>
            <Divider sx={{my: 2}}/>
            {!isReady && (
                <Alert severity="info">
                    Cargá primero un snippet para poder gestionar sus tests.
                </Alert>
            )}
            {isReady && (
                <Box mt={2} display="flex" minHeight={320}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="snippet tests tabs"
                        sx={{borderRight: 1, borderColor: 'divider', minWidth: 200}}
                    >
                        {tests.map((test) => (
                            <Tab key={test.id} label={test.name}/>
                        ))}
                        <IconButton disableRipple onClick={handleAddTab} disabled={loadingTests}>
                            <AddRounded/>
                        </IconButton>
                    </Tabs>
                    <Box flex={1} minWidth={360}>
                        {loadingTests ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress size={24}/>
                            </Box>
                        ) : (
                            <>
                                {tests.map((test, index) => (
                                    <TabPanel
                                        key={test.id}
                                        index={index}
                                        value={value}
                                        test={test}
                                        setTestCase={postTestCase}
                                        removeTestCase={removeTestCase}
                                        onExecute={() => handleExecute(test.id)}
                                        execution={executions[test.id]}
                                        isExecuting={runningTest}
                                    />
                                ))}
                                <TabPanel
                                    index={creationIndex}
                                    value={value}
                                    setTestCase={postTestCase}
                                />
                                {tests.length === 0 && value !== creationIndex && (
                                    <Alert severity="info" sx={{mt: 2}}>
                                        No hay tests configurados. Hacé click en el botón + para crear el primero.
                                    </Alert>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            )}
        </ModalWrapper>
    )
}
