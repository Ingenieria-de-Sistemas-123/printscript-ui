import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputBase,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    SelectChangeEvent,
    styled,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";
import {AddSnippetModal} from "./AddSnippetModal.tsx";
import {useRef, useState} from "react";
import {Add, Search} from "@mui/icons-material";
import {LoadingSnippetRow, SnippetRow} from "./SnippetRow.tsx";
import {CreateSnippetWithLang, getFileLanguage, Snippet} from "../../utils/snippet.ts";
import {usePaginationContext} from "../../contexts/paginationContext.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {useGetFileTypes} from "../../utils/queries.tsx";

export type SnippetTableFilters = {
    relation: 'all' | 'owned' | 'shared';
    language: string;
    validity: 'all' | 'valid' | 'invalid';
    sortBy: 'name' | 'language' | 'valid';
    sortDir: 'asc' | 'desc';
}

type SnippetTableProps = {
    handleClickSnippet: (id: string) => void;
    snippets?: Snippet[];
    loading: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters: SnippetTableFilters;
    onFilterChange: (filters: Partial<SnippetTableFilters>) => void;
}

export const SnippetTable = (props: SnippetTableProps) => {
    const {snippets, handleClickSnippet, loading, searchValue, onSearchChange, filters, onFilterChange} = props;
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [popoverMenuOpened, setPopoverMenuOpened] = useState(false)
    const [snippet, setSnippet] = useState<CreateSnippetWithLang | undefined>()

    const popoverRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const {page, page_size: pageSize, count, handleChangePageSize, handleGoToPage} = usePaginationContext()
    const {createSnackbar} = useSnackbarContext()
    const {data: fileTypes} = useGetFileTypes();

    const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
        const files = target.files
        if (!files || !files.length) {
            createSnackbar('error',"Please select at leat one file")
            return
        }
        const file = files[0]
        const splitName = file.name.split(".")
        const fileType = getFileLanguage(fileTypes ?? [], splitName.at(-1))
        if (!fileType) {
            createSnackbar('error', `File type ${splitName.at(-1)} not supported`)
            return
        }
        file.text().then((text) => {
            setSnippet({
                name: splitName[0],
                content: text,
                language: fileType.language,
                extension: fileType.extension
            })
        }).catch(e => {
            console.error(e)
        }).finally(() => {
            setAddModalOpened(true)
            target.value = ""
        })
    }

    function handleClickMenu() {
        setPopoverMenuOpened(false)
    }

    const handleSelectChange = (key: keyof SnippetTableFilters) => (event: SelectChangeEvent<string>) => {
        onFilterChange({ [key]: event.target.value } as Partial<SnippetTableFilters>)
    }

    return (
        <>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Box sx={{background: 'white', width: '30%', display: 'flex'}}>
                    <InputBase
                        sx={{ml: 1, flex: 1}}
                        placeholder="Search FileType"
                        inputProps={{'aria-label': 'search'}}
                        value={searchValue}
                        onChange={e => onSearchChange(e.target.value)}
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
            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                <FormControl size="small" sx={{minWidth: 160}}>
                    <InputLabel id="relation-filter-label">Relation</InputLabel>
                    <Select
                        labelId="relation-filter-label"
                        label="Relation"
                        value={filters.relation}
                        onChange={handleSelectChange("relation")}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="owned">Owned</MenuItem>
                        <MenuItem value="shared">Shared</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{minWidth: 160}}>
                    <InputLabel id="language-filter-label">Language</InputLabel>
                    <Select
                        labelId="language-filter-label"
                        label="Language"
                        value={filters.language}
                        onChange={handleSelectChange("language")}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {fileTypes?.map(type => (
                            <MenuItem key={type.language} value={type.language}>{type.language}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{minWidth: 160}}>
                    <InputLabel id="validity-filter-label">Validity</InputLabel>
                    <Select
                        labelId="validity-filter-label"
                        label="Validity"
                        value={filters.validity}
                        onChange={handleSelectChange("validity")}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="valid">Valid</MenuItem>
                        <MenuItem value="invalid">Invalid</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{minWidth: 160}}>
                    <InputLabel id="sort-by-label">Sort by</InputLabel>
                    <Select
                        labelId="sort-by-label"
                        label="Sort by"
                        value={filters.sortBy}
                        onChange={handleSelectChange("sortBy")}
                    >
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="language">Language</MenuItem>
                        <MenuItem value="valid">Validity</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{minWidth: 120}}>
                    <InputLabel id="sort-dir-label">Direction</InputLabel>
                    <Select
                        labelId="sort-dir-label"
                        label="Direction"
                        value={filters.sortDir}
                        onChange={handleSelectChange("sortDir")}
                    >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                </FormControl>
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
