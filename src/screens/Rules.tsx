import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Grid,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import {
    useGetFormatRules,
    useGetLintingRules,
    useModifyFormatRules,
    useModifyLintingRules,
    useFormatAllSnippets,
    useLintAllSnippets,
} from "../utils/queries";
import { Rule } from "../types/Rule";
import { withNavbar } from "../components/navbar/withNavbar";

const RulesScreen: React.FC = () => {
    // ---- Queries ----
    const {
        data: formatRules,
        isLoading: loadingFormatRules,
        error: formatRulesError,
    } = useGetFormatRules();

    const {
        data: lintRules,
        isLoading: loadingLintRules,
        error: lintRulesError,
    } = useGetLintingRules();

    const { mutate: saveFormatRules, isLoading: savingFormat } =
        useModifyFormatRules({
            onSuccess: () => {
                console.log("Reglas de formato guardadas");
            },
        });

    const { mutate: saveLintRules, isLoading: savingLint } =
        useModifyLintingRules({
            onSuccess: () => {
                console.log("Reglas de lint guardadas");
            },
        });

    const { mutate: formatAllSnippets, isLoading: formattingAll } =
        useFormatAllSnippets();

    const { mutate: lintAllSnippets, isLoading: lintingAll } =
        useLintAllSnippets();

    // ---- Estado local editable ----
    const [localFormatRules, setLocalFormatRules] = useState<Rule[]>([]);
    const [localLintRules, setLocalLintRules] = useState<Rule[]>([]);

    useEffect(() => {
        if (formatRules) setLocalFormatRules(formatRules);
    }, [formatRules]);

    useEffect(() => {
        if (lintRules) setLocalLintRules(lintRules);
    }, [lintRules]);

    const handleToggleRule = (
        type: "format" | "lint",
        id: string,
        isActive: boolean
    ) => {
        const setter = type === "format" ? setLocalFormatRules : setLocalLintRules;
        const rules = type === "format" ? localFormatRules : localLintRules;

        setter(rules.map((r) => (r.id === id ? { ...r, isActive } : r)));
    };

    const handleValueChange = (
        type: "format" | "lint",
        id: string,
        value: string
    ) => {
        const setter = type === "format" ? setLocalFormatRules : setLocalLintRules;
        const rules = type === "format" ? localFormatRules : localLintRules;

        const parsed =
            value === "" ? null : Number.isNaN(Number(value)) ? null : Number(value);

        setter(
            rules.map((r) => (r.id === id ? { ...r, value: parsed } : r))
        );
    };

    const handleSaveFormat = () => {
        if (localFormatRules.length > 0) {
            saveFormatRules(localFormatRules);
        }
    };

    const handleSaveLint = () => {
        if (localLintRules.length > 0) {
            saveLintRules(localLintRules);
        }
    };

    const isLoading =
        loadingFormatRules || loadingLintRules || savingFormat || savingLint;

    return (
        <Box p={4}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Reglas de Linting & Formatting
            </Typography>

            {(formatRulesError || lintRulesError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error cargando reglas. Reintentá más tarde.
                </Alert>
            )}

            {isLoading && (
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">
                        Guardando / cargando reglas…
                    </Typography>
                </Stack>
            )}

            <Grid container spacing={3}>
                {/* -------- Reglas de Formato -------- */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Reglas de formato"
                            subheader="Configura cómo se van a formatear tus snippets."
                            action={
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => formatAllSnippets()}
                                        disabled={formattingAll}
                                    >
                                        {formattingAll ? "Formateando…" : "Formatear todos"}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleSaveFormat}
                                        disabled={savingFormat}
                                    >
                                        Guardar
                                    </Button>
                                </Stack>
                            }
                        />
                        <CardContent>
                            {loadingFormatRules && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2">
                                        Cargando reglas de formato…
                                    </Typography>
                                </Stack>
                            )}

                            {!loadingFormatRules && localFormatRules.length === 0 && (
                                <Typography variant="body2">
                                    No hay reglas de formato configuradas.
                                </Typography>
                            )}

                            {!loadingFormatRules &&
                                localFormatRules.map((rule) => (
                                    <Box
                                        key={rule.id}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1.5}
                                        gap={2}
                                    >
                                        <Box>
                                            <Typography fontWeight="bold">{rule.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {rule.id}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {typeof rule.value !== "undefined" && (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="Valor"
                                                    value={rule.value ?? ""}
                                                    onChange={(e) =>
                                                        handleValueChange(
                                                            "format",
                                                            rule.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    sx={{ width: 100 }}
                                                />
                                            )}
                                            <Switch
                                                checked={rule.isActive}
                                                onChange={(e) =>
                                                    handleToggleRule(
                                                        "format",
                                                        rule.id,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Box>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* -------- Reglas de Lint -------- */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Reglas de lint"
                            subheader="Configura las reglas que se aplican al analizar tus snippets."
                            action={
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => lintAllSnippets()}
                                        disabled={lintingAll}
                                    >
                                        {lintingAll ? "Re-evaluando…" : "Re-evaluar todos"}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleSaveLint}
                                        disabled={savingLint}
                                    >
                                        Guardar
                                    </Button>
                                </Stack>
                            }
                        />
                        <CardContent>
                            {loadingLintRules && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2">
                                        Cargando reglas de lint…
                                    </Typography>
                                </Stack>
                            )}

                            {!loadingLintRules && localLintRules.length === 0 && (
                                <Typography variant="body2">
                                    No hay reglas de lint configuradas.
                                </Typography>
                            )}

                            {!loadingLintRules &&
                                localLintRules.map((rule) => (
                                    <Box
                                        key={rule.id}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1.5}
                                        gap={2}
                                    >
                                        <Box>
                                            <Typography fontWeight="bold">{rule.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {rule.id}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {typeof rule.value !== "undefined" && (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="Valor"
                                                    value={rule.value ?? ""}
                                                    onChange={(e) =>
                                                        handleValueChange("lint", rule.id, e.target.value)
                                                    }
                                                    sx={{ width: 100 }}
                                                />
                                            )}
                                            <Switch
                                                checked={rule.isActive}
                                                onChange={(e) =>
                                                    handleToggleRule(
                                                        "lint",
                                                        rule.id,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Box>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default withNavbar(RulesScreen);
