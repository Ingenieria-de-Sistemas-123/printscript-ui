import {
    Box,
    Button,
    IconButton,
    InputBase,
    Menu,
    MenuItem,
    styled,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TextField
} from "@mui/material";
import {AddSnippetModal} from "./AddSnippetModal.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {Add, Search} from "@mui/icons-material";
import {LoadingSnippetRow, SnippetRow} from "./SnippetRow.tsx";
import {CreateSnippetWithLang, getFileLanguage} from "../../utils/snippet.ts";
import {usePaginationContext} from "../../contexts/paginationContext.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {useGetFileTypes} from "../../utils/queries.tsx";
import {SnippetDetails, SnippetListFilters} from "../../types/snippetDetails.ts";

type SnippetTableProps = {
    handleClickSnippet: (id: string) => void;
    snippets?: SnippetDetails[];
    loading: boolean;
    handleSearchSnippet: (snippetName: string) => void;
    filters: SnippetListFilters;
    onChangeFilters: (filters: SnippetListFilters) => void;
}

const readFileAsText = (file: File): Promise<string> => {
    if (typeof file.text === "function") return file.text()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ""))
        reader.onerror = () => reject(reader.error ?? new Error("Error reading file"))
        reader.readAsText(file)
    })
}

export const SnippetTable = (props: SnippetTableProps) => {
    const {snippets, handleClickSnippet, loading,handleSearchSnippet, filters, onChangeFilters} = props;
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [popoverMenuOpened, setPopoverMenuOpened] = useState(false)
    const [snippet, setSnippet] =
        useState<(CreateSnippetWithLang & { description?: string; version?: string }) | undefined>()
    const [pendingFile, setPendingFile] = useState<File | null>(null)

    const popoverRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const {page, page_size: pageSize, count, handleChangePageSize, handleGoToPage} = usePaginationContext()
    const {createSnackbar} = useSnackbarContext()
    const {data: fileTypes} = useGetFileTypes();

    const loadSnippetFromFile = useCallback((file: File, supportedFileTypes: typeof fileTypes) => {
        const splitName = file.name.split(".")
        const fileType = getFileLanguage(supportedFileTypes ?? [], splitName.at(-1))
        if (!fileType) {
            createSnackbar('error', `File type ${splitName.at(-1)} not supported`)
            return
        }
        readFileAsText(file).then((text) => {
            setSnippet({
                name: splitName[0],
                content: text,
                language: fileType.language,
                extension: fileType.extension,
                description: "",
                version: "1.0"
            })
        }).catch(e => {
            console.error(e)
        }).finally(() => {
            setAddModalOpened(true)
        })
    }, [createSnackbar])

    const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
        const files = target.files
        if (!files || !files.length) {
            createSnackbar('error',"Please select at leat one file")
            return
        }
        const file = files[0]
        target.value = ""

        if (!fileTypes?.length) {
            setPendingFile(file)
            return
        }

        loadSnippetFromFile(file, fileTypes)
    }

    useEffect(() => {
        if (!pendingFile) return
        if (!fileTypes?.length) return
        loadSnippetFromFile(pendingFile, fileTypes)
        setPendingFile(null)
    }, [pendingFile, fileTypes, loadSnippetFromFile])

    function handleClickMenu() {
        setPopoverMenuOpened(false)
    }

    const handleFiltersChange = (changes: Partial<SnippetListFilters>) => {
        onChangeFilters({
            ...filters,
            ...changes
        })
    }

    const relationValue = filters.relation ?? 'all'
    const validValue = typeof filters.valid === 'boolean' ? (filters.valid ? 'valid' : 'invalid') : 'all'
    const languageFilter = filters.language ?? 'all'
    const sortByValue = filters.sortBy ?? 'updated_at'
    const sortDirValue = filters.sortDir ?? 'desc'

    return (
        <>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Box sx={{background: 'white', width: '30%', display: 'flex'}}>
                    <InputBase
                        sx={{ml: 1, flex: 1}}
                        placeholder="Buscar snippet"
                        inputProps={{'aria-label': 'search'}}
                        onChange={e => handleSearchSnippet(e.target.value)}
                    />
                    <IconButton type="button" sx={{p: '10px'}} aria-label="search">
                        <Search/>
                    </IconButton>
                </Box>
                <Button ref={popoverRef} variant="contained" disableRipple sx={{boxShadow: 0}}
                        onClick={() => setPopoverMenuOpened(true)}>
                    <Add/>
                    Add Snippet
                </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={2} my={2}>
                <TextField
                    select
                    label="Relación"
                    value={relationValue}
                    onChange={e => handleFiltersChange({relation: e.target.value as 'all' | 'owned' | 'shared'})}
                    sx={{minWidth: 150}}
                >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="owned">Propias</MenuItem>
                    <MenuItem value="shared">Compartidas</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Validez"
                    value={validValue}
                    onChange={e => handleFiltersChange({valid: e.target.value === 'all' ? undefined : e.target.value === 'valid'})}
                    sx={{minWidth: 150}}
                >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="valid">Válidas</MenuItem>
                    <MenuItem value="invalid">Inválidas</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Lenguaje"
                    value={languageFilter}
                    onChange={e => handleFiltersChange({language: e.target.value === 'all' ? undefined : e.target.value})}
                    sx={{minWidth: 150}}
                >
                    <MenuItem value="all">Todos</MenuItem>
                    {fileTypes?.map(ft => (
                        <MenuItem key={ft.language} value={ft.language}>{ft.language}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Ordenar por"
                    value={sortByValue}
                    onChange={e => handleFiltersChange({sortBy: e.target.value})}
                    sx={{minWidth: 180}}
                >
                    <MenuItem value="updated_at">Actualización</MenuItem>
                    <MenuItem value="created_at">Creación</MenuItem>
                    <MenuItem value="name">Nombre</MenuItem>
                    <MenuItem value="language">Lenguaje</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Dirección"
                    value={sortDirValue}
                    onChange={e => handleFiltersChange({sortDir: e.target.value as 'asc' | 'desc'})}
                    sx={{minWidth: 140}}
                >
                    <MenuItem value="asc">Ascendente</MenuItem>
                    <MenuItem value="desc">Descendente</MenuItem>
                </TextField>
            </Box>
            <Table size="medium" sx={{borderSpacing: "0 10px", borderCollapse: "separate"}}>
                <TableHead>
                    <TableRow sx={{fontWeight: 'bold'}}>
                        <StyledTableCell sx={{fontWeight: "bold"}}>Name</StyledTableCell>
                        <StyledTableCell sx={{fontWeight: "bold"}}>Language</StyledTableCell>
                        <StyledTableCell sx={{fontWeight: "bold"}}>Author</StyledTableCell>
                        <StyledTableCell sx={{fontWeight: "bold"}}>Relation</StyledTableCell>
                        <StyledTableCell sx={{fontWeight: "bold"}}>Conformance</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{
                    loading ? (
                        <>
                            {Array.from({length: 10}).map((_, index) => (
                                <LoadingSnippetRow key={index}/>
                            ))}
                        </>
                    ) : (
                        <>
                            {
                                snippets && snippets.map((snippet) => (
                                    <SnippetRow data-testid={"snippet-row"}
                                                onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet}/>
                                ))
                            }
                        </>
                    )
                }
                </TableBody>
                <TablePagination count={count} page={page} rowsPerPage={pageSize}
                                 onPageChange={(_, page) => handleGoToPage(page)}
                                 onRowsPerPageChange={e => handleChangePageSize(Number(e.target.value))}/>
            </Table>
            <AddSnippetModal defaultSnippet={snippet} open={addModalOpened}
                             onClose={() => setAddModalOpened(false)}/>
            <Menu anchorEl={popoverRef.current} open={popoverMenuOpened} onClick={handleClickMenu}>
                <MenuItem onClick={() => setAddModalOpened(true)}>Create snippet</MenuItem>
                <MenuItem onClick={() => inputRef?.current?.click()}>Load snippet from file</MenuItem>
            </Menu>
            <input hidden type={"file"} ref={inputRef} multiple={false} data-testid={"upload-file-input"}
                   onChange={e => handleLoadSnippet(e?.target)}/>
        </>
    )
}


export const StyledTableCell = styled(TableCell)`
    border: 0;
    align-items: center;
`
