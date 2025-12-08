import {Alert, Box, Divider, Tab, Tabs, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {SyntheticEvent, useState} from "react";
import {SnippetDetails, SnippetTestExecution} from "../../types/snippetDetails.ts";
import {useExecuteSnippetTest} from "../../utils/queries.tsx";
import {TabPanel} from "./TabPanel.tsx";

type TestSnippetModalProps = {
    open: boolean;
    onClose: () => void;
    snippet?: SnippetDetails;
}

export const TestSnippetModal = ({open, onClose, snippet}: TestSnippetModalProps) => {
    const tests = snippet?.tests ?? [];
    const [value, setValue] = useState(0);
    const [executions, setExecutions] = useState<Record<string, SnippetTestExecution>>({});
    const {mutateAsync, isLoading} = useExecuteSnippetTest();

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleExecute = async (testId: string) => {
        if (!snippet) return;
        const result = await mutateAsync({snippetId: snippet.id, testId});
        setExecutions(prev => ({...prev, [testId]: result}));
    }

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"} fontWeight="bold">Snippet tests</Typography>
            <Typography variant="body2" color="text.secondary">
                En esta vista podés ejecutar cada test registrado para el snippet.
            </Typography>
            <Divider sx={{my: 2}}/>
            {tests.length === 0 ? (
                <Alert severity="info">
                    Este snippet todavía no tiene tests definidos. Crealos desde el backend para habilitar la ejecución.
                </Alert>
            ) : (
                <Box mt={2} display="flex">
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
                    </Tabs>
                    {tests.map((test, index) => (
                        <TabPanel
                            key={test.id}
                            index={index}
                            value={value}
                            test={test}
                            execution={executions[test.id]}
                            onExecute={() => handleExecute(test.id)}
                            isExecuting={isLoading}
                        />
                    ))}
                </Box>
            )}
        </ModalWrapper>
    )
}
