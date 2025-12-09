import {ChangeEvent, useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
    useUpdateSnippetById
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetFileTypes, useGetSnippetById, useShareSnippet} from "../utils/queries.tsx";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, UploadFile} from "@mui/icons-material";
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {Snippet, getDefaultLanguageVersion, getFileLanguage} from "../utils/snippet.ts";
import {SnippetExecution} from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {queryClient} from "../App.tsx";
import {DeleteConfirmationModal} from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import {useSnackbarContext} from "../contexts/snackbarContext.tsx";

type SnippetDetailProps = {
    id: string;
    handleCloseModal: () => void;
}

type SnippetMetadata = {
    name?: string;
    description?: string;
    language?: string;
    version?: string;
    extension?: string;
}

const DownloadButton = ({snippet}: { snippet?: Snippet }) => {
    if (!snippet) return null;
    const file = new Blob([snippet.content], {type: 'text/plain'});

    return (
        <Tooltip title={"Download"}>
            <IconButton sx={{
                cursor: "pointer"
            }}>
                <a download={`${snippet.name}.${snippet.extension}`} target="_blank"
                   rel="noreferrer" href={URL.createObjectURL(file)} style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Download/>
                </a>
            </IconButton>
        </Tooltip>
    )
}

export const SnippetDetail = (props: SnippetDetailProps) => {
    const {id, handleCloseModal} = props;
    const [code, setCode] = useState(
        ""
    );
    const [snippetMeta, setSnippetMeta] = useState<SnippetMetadata | undefined>(undefined)
    const [shareModalOppened, setShareModalOppened] = useState(false)
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false)
    const [testModalOpened, setTestModalOpened] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const {createSnackbar} = useSnackbarContext()

    const {data: snippet, isLoading} = useGetSnippetById(id);
    const {data: fileTypes} = useGetFileTypes();
    const {mutate: shareSnippet, isLoading: loadingShare} = useShareSnippet()
    const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet()
    const {mutate: updateSnippet, isLoading: isUpdateSnippetLoading} = useUpdateSnippetById({
        onSuccess: () => queryClient.invalidateQueries(['snippet', id]),
        onError: (error) => createSnackbar('error', error.message)
    })

    useEffect(() => {
        if (snippet) {
            setCode(snippet.content ?? "");
            setSnippetMeta({
                name: snippet.name,
                description: snippet.description,
                language: snippet.language,
                version: snippet.version,
                extension: snippet.extension,
            })
        }
    }, [snippet]);

    useEffect(() => {
        if (formatSnippetData) {
            setCode(formatSnippetData)
        }
    }, [formatSnippetData])


    async function handleShareSnippet(userId: string) {
        shareSnippet({snippetId: id, userId})
    }

    const handleLoadSnippetFromFile = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || !files.length) {
            createSnackbar('error', "Please select a file to upload")
            return
        }
        const file = files[0]
        const splitName = file.name.split(".")
        const extension = splitName.pop()
        const baseName = splitName.join(".") || file.name
        if (!extension) {
            createSnackbar('error', "Unable to determine file extension")
            event.target.value = ""
            return
        }

        if (!fileTypes) {
            createSnackbar('error', "File types are still loading. Please try again in a moment.")
            event.target.value = ""
            return
        }

        const fileType = getFileLanguage(fileTypes, extension)
        if (!fileType) {
            createSnackbar('error', `File type .${extension} not supported`)
            event.target.value = ""
            return
        }

        file.text().then((text) => {
            setCode(text)
            setSnippetMeta(prev => ({
                ...prev,
                name: baseName,
                language: fileType.language,
                extension: fileType.extension,
                version: getDefaultLanguageVersion(fileTypes ?? [], fileType.language) ?? prev?.version,
            }))
            createSnackbar('info', 'Snippet content loaded from file')
        }).catch(() => {
            createSnackbar('error', "Error reading selected file")
        }).finally(() => {
            event.target.value = ""
        })
    }

    const handleSaveSnippet = () => {
        const name = snippetMeta?.name ?? snippet?.name
        const language = snippetMeta?.language ?? snippet?.language
        if (!name || !language) {
            createSnackbar('error', "Name and language are required to update a snippet")
            return
        }
        updateSnippet({
            id: id,
            updateSnippet: {
                name,
                language,
                content: code,
                description: snippetMeta?.description ?? snippet?.description,
                version: snippetMeta?.version ?? snippet?.version,
                extension: snippetMeta?.extension ?? snippet?.extension,
            }
        })
    }

    const isSnippetDirty = snippet ? (
        snippet.content !== code ||
        (snippetMeta?.name !== undefined && snippetMeta.name !== snippet.name) ||
        (snippetMeta?.language !== undefined && snippetMeta.language !== snippet.language) ||
        (snippetMeta?.description !== undefined && snippetMeta.description !== snippet.description) ||
        (snippetMeta?.version !== undefined && snippetMeta.version !== snippet.version) ||
        (snippetMeta?.extension !== undefined && snippetMeta.extension !== snippet.extension)
    ) : false

    return (
        <Box p={4} minWidth={'60vw'}>
            <Box width={'100%'} p={2} display={'flex'} justifyContent={'flex-end'}>
                <CloseIcon style={{cursor: "pointer"}} onClick={handleCloseModal}/>
            </Box>
            {
                isLoading ? (<>
                    <Typography fontWeight={"bold"} mb={2} variant="h4">Loading...</Typography>
                    <CircularProgress/>
                </>) : <>
                    <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
                    <Box display="flex" flexDirection="row" gap="8px" padding="8px">
                        <Tooltip title={"Share"}>
                            <IconButton onClick={() => setShareModalOppened(true)}>
                                <Share/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Test"}>
                            <IconButton onClick={() => setTestModalOpened(true)}>
                                <BugReport/>
                            </IconButton>
                        </Tooltip>
                        <DownloadButton snippet={snippet}/>
                        <Tooltip title={"Load content from file"}>
                            <IconButton onClick={() => fileInputRef.current?.click()}>
                                <UploadFile/>
                            </IconButton>
                        </Tooltip>
                        {/*<Tooltip title={runSnippet ? "Stop run" : "Run"}>*/}
                        {/*  <IconButton onClick={() => setRunSnippet(!runSnippet)}>*/}
                        {/*    {runSnippet ? <StopRounded/> : <PlayArrow/>}*/}
                        {/*  </IconButton>*/}
                        {/*</Tooltip>*/}
                        {/* TODO: we can implement a live mode*/}
                        <Tooltip title={"Format"}>
                            <IconButton
                                onClick={() =>
                                    formatSnippet({
                                        content: code,
                                        language: snippetMeta?.language ?? snippet?.language ?? "printscript",
                                        version: snippetMeta?.version ?? snippet?.version ?? "1.0",
                                    })
                                }
                                disabled={isFormatLoading}
                            >
                                <ReadMoreIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Save changes"}>
                            <IconButton color={"primary"} onClick={handleSaveSnippet} disabled={isUpdateSnippetLoading || !isSnippetDirty} >
                                <Save />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Delete"}>
                            <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                                <Delete color={"error"} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box display={"flex"} gap={2}>
                        <Bòx flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'} color={'white'} code={code}>
                            <Editor
                                value={code}
                                padding={10}
                                onValueChange={(code) => setCode(code)}
                                highlight={(code) => highlight(code, languages.js, "javascript")}
                                maxLength={1000}
                                style={{
                                    minHeight: "500px",
                                    fontFamily: "monospace",
                                    fontSize: 17,
                                }}
                            />
                        </Bòx>
                    </Box>
                    {snippet?.lintErrors && snippet.lintErrors.length > 0 && (
                        <Box marginTop={2}>
                            <Alert severity="error">
                                <Typography fontWeight={"bold"} mb={1}>Lint issues detected</Typography>
                                <Box component="ul" sx={{paddingLeft: 3, margin: 0}}>
                                    {snippet.lintErrors.map((lintError, index) => {
                                        const hasLine = typeof lintError.line === "number"
                                        const hasColumn = typeof lintError.column === "number"
                                        const location = hasLine
                                            ? ` (line ${lintError.line}${hasColumn ? `, column ${lintError.column}` : ""})`
                                            : ""
                                        return (
                                            <li key={`${lintError.rule ?? 'lint'}-${lintError.line ?? 'no-line'}-${index}`}>
                                                {lintError.rule ? `${lintError.rule}: ` : ""}
                                                {lintError.message}
                                                {location}
                                            </li>
                                        )
                                    })}
                                </Box>
                            </Alert>
                        </Box>
                    )}
                    <Box pt={1} flex={1} marginTop={2}>
                        <Alert severity="info">Output</Alert>
                        <SnippetExecution />
                    </Box>
                </>
            }
            <input hidden ref={fileInputRef} type="file" onChange={handleLoadSnippetFromFile}/>
            <ShareSnippetModal loading={loadingShare || isLoading} open={shareModalOppened}
                               onClose={() => setShareModalOppened(false)}
                               onShare={handleShareSnippet}/>
            <TestSnippetModal open={testModalOpened} onClose={() => setTestModalOpened(false)}/>
            <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={snippet?.id ?? ""} setCloseDetails={handleCloseModal} />
        </Box>
    );
}
