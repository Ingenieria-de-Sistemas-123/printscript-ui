import {SnippetTest, SnippetTestExecution} from "../../types/snippetDetails.ts";
import {Alert, Box, Button, Chip, Typography} from "@mui/material";
import {BugReport} from "@mui/icons-material";

type TabPanelProps = {
    index: number;
    value: number;
    test: SnippetTest;
    execution?: SnippetTestExecution;
    onExecute: () => void;
    isExecuting: boolean;
}

export const TabPanel = ({value, index, test, execution, onExecute, isExecuting}: TabPanelProps) => {
    const isActive = value === index;

    return (
        <div
            role="tabpanel"
            hidden={!isActive}
            id={`snippet-test-tabpanel-${index}`}
            aria-labelledby={`snippet-test-tab-${index}`}
            style={{width: '100%', height: '100%'}}
        >
            {isActive && (
                <Box sx={{px: 3}} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Nombre</Typography>
                        <Typography>{test.name}</Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Script</Typography>
                        <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                            {test.script}
                        </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Última ejecución</Typography>
                        <Typography variant="body2">
                            {test.lastRunAt ? new Date(test.lastRunAt).toLocaleString() : "Nunca ejecutado"}
                        </Typography>
                    </Box>
                    <Box display="flex" flexDirection="row" gap={1}>
                        <Button onClick={onExecute} variant={"contained"} startIcon={<BugReport/>} disableElevation disabled={isExecuting}>
                            Ejecutar test
                        </Button>
                        {execution && (
                            execution.passed ? <Chip label="Pass" color="success"/> :
                                <Chip label="Fail" color="error"/>
                        )}
                    </Box>
                    {execution && (
                        <Alert severity={execution.passed ? "success" : "error"}>
                            <Typography>Exit code: {execution.exitCode}</Typography>
                            {execution.stdout && (
                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap', mt: 1}}>
                                    STDOUT{'\n'}{execution.stdout}
                                </Typography>
                            )}
                            {execution.stderr && (
                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap', mt: 1}}>
                                    STDERR{'\n'}{execution.stderr}
                                </Typography>
                            )}
                        </Alert>
                    )}
                </Box>
            )}
        </div>
    );
}
