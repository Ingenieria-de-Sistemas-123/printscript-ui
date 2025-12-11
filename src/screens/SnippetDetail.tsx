import { useEffect, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useUpdateSnippetById,
  useFormatSnippet,
  useGetFileTypes,
  useGetSnippetById,
  useShareSnippet,
} from "../utils/queries.tsx";
import { Bòx } from "../components/snippet-table/SnippetBox.tsx";
import { BugReport, Delete, Download, Save, Share } from "@mui/icons-material";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-test/TestSnippetModal.tsx";
import { UpdateSnippet } from "../utils/snippet.ts";
import { SnippetExecution } from "./SnippetExecution.tsx";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import { queryClient } from "../App.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import {
  FormatSnippetPayload,
  SnippetDetails,
  SnippetLintError,
} from "../types/snippetDetails.ts";

type SnippetDetailProps = {
  id: string;
  handleCloseModal: () => void;
};

const DownloadButton = ({ snippet }: { snippet?: SnippetDetails }) => {
  if (!snippet?.content) return null;
  const file = new Blob([snippet.content], { type: "text/plain" });

  return (
      <Tooltip title={"Download"}>
        <IconButton
            sx={{
              cursor: "pointer",
            }}
        >
          <a
              download={`${snippet.name}.${snippet.extension ?? "prs"}`}
              target="_blank"
              rel="noreferrer"
              href={URL.createObjectURL(file)}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
              }}
          >
            <Download />
          </a>
        </IconButton>
      </Tooltip>
  );
};

export const SnippetDetail = (props: SnippetDetailProps) => {
  const { id, handleCloseModal } = props;
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [languageValue, setLanguageValue] = useState("");
  const [version, setVersion] = useState("");
  const [shareModalOppened, setShareModalOppened] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
      useState(false);
  const [testModalOpened, setTestModalOpened] = useState(false);

  const { data: snippet, isLoading } = useGetSnippetById(id);
  const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet();
  const {
    mutate: formatSnippet,
    isLoading: isFormatLoading,
    data: formatSnippetData,
  } = useFormatSnippet();
  const { mutate: updateSnippet, isLoading: isUpdateSnippetLoading } =
      useUpdateSnippetById({
        onSuccess: () => queryClient.invalidateQueries(["snippet", id]),
      });
  const { data: fileTypes } = useGetFileTypes();

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content ?? "");
      setName(snippet.name ?? "");
      setDescription(snippet.description ?? "");
      setLanguageValue(snippet.language ?? "");
      setVersion((snippet as SnippetDetails).version ?? "");
    }
  }, [snippet]);

  useEffect(() => {
    if (formatSnippetData) {
      setCode(formatSnippetData);
    }
  }, [formatSnippetData]);

  async function handleShareSnippet(userId: string) {
    shareSnippet({ snippetId: id, userId });
  }

  type UpdateSnippetPayload = UpdateSnippet & {
    name: string;
    description: string;
    language: string;
    version: string;
    extension: string;
  };

  const extensionFromLanguage = fileTypes?.find(
      (ft) => ft.language === languageValue,
  )?.extension;
  const currentExtension =
      extensionFromLanguage ?? snippet?.extension ?? "prs";

  const canSave = useMemo(() => {
    if (!snippet) return false;
    return (
        !!name &&
        !!languageValue &&
        !!version &&
        (snippet.name !== name ||
            (snippet.description ?? "") !== description ||
            snippet.language !== languageValue ||
            ((snippet as SnippetDetails).version ?? "") !== version ||
            (snippet.content ?? "") !== code)
    );
  }, [code, description, languageValue, name, snippet, version]);

  const lintErrors: SnippetLintError[] =
      (snippet as SnippetDetails)?.lintErrors ?? [];

  const handleFormat = () => {
    const payload: FormatSnippetPayload = {
      content: code,
      language: languageValue,
      version,
    };
    formatSnippet(payload);
  };

  const handleSave = () => {
    if (!snippet) return;
    const payload: UpdateSnippetPayload = {
      name,
      description,
      language: languageValue,
      version,
      content: code,
      extension: currentExtension,
    };
    updateSnippet({
      id,
      updateSnippet: payload,
    });
  };

  return (
      <Box p={4} minWidth={"60vw"}>
        <Box
            width={"100%"}
            p={2}
            display={"flex"}
            justifyContent={"flex-end"}
        >
          <CloseIcon style={{ cursor: "pointer" }} onClick={handleCloseModal} />
        </Box>
        {isLoading ? (
            <>
              <Typography fontWeight={"bold"} mb={2} variant="h4">
                Loading...
              </Typography>
              <CircularProgress />
            </>
        ) : (
            <>
              <Typography variant="h4" fontWeight={"bold"}>
                {snippet?.name ?? "Snippet"}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} py={2}>
                <TextField
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                />
                <Box display="flex" gap={2} flexWrap="wrap">
                  <TextField
                      label="Lenguaje"
                      select
                      value={languageValue}
                      onChange={(e) => setLanguageValue(e.target.value)}
                      sx={{ minWidth: 200 }}
                  >
                    {fileTypes?.map((ft) => (
                        <MenuItem key={ft.language} value={ft.language}>
                          {ft.language}
                        </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                      label="Versión"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      sx={{ width: 200 }}
                  />
                </Box>
              </Box>

              <Box
                  display="flex"
                  flexDirection="row"
                  gap="8px"
                  padding="8px"
                  alignItems="center"
              >
                <Tooltip title={"Share"}>
                  <IconButton onClick={() => setShareModalOppened(true)}>
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title={"Test"}>
                  <IconButton onClick={() => setTestModalOpened(true)}>
                    <BugReport />
                  </IconButton>
                </Tooltip>
                <DownloadButton snippet={snippet} />
                <Tooltip title={"Format"}>
                  <IconButton
                      onClick={handleFormat}
                      disabled={isFormatLoading || !languageValue || !version}
                  >
                    <ReadMoreIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={"Save changes"}>
                  <IconButton
                      color={"primary"}
                      onClick={handleSave}
                      disabled={isUpdateSnippetLoading || !canSave}
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
                <Tooltip title={"Delete"}>
                  <IconButton
                      onClick={() => setDeleteConfirmationModalOpen(true)}
                  >
                    <Delete color={"error"} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box display={"flex"} gap={2}>
                <Bòx
                    flex={1}
                    height={"fit-content"}
                    overflow={"none"}
                    minHeight={"500px"}
                    bgcolor={"black"}
                    color={"white"}
                    code={code}
                >
                  <Editor
                      value={code}
                      padding={10}
                      onValueChange={(val) => setCode(val)}
                      highlight={(val) =>
                          highlight(val, languages.js, "javascript")
                      }
                      maxLength={1000}
                      style={{
                        minHeight: "500px",
                        fontFamily: "monospace",
                        fontSize: 17,
                      }}
                  />
                </Bòx>
              </Box>

              {lintErrors.length > 0 && (
                  <Box mt={2}>
                    <Alert severity="error">
                      {lintErrors.map((error) => (
                          <Box
                              key={`${error.rule}-${error.line}-${error.column}`}
                              display="flex"
                              flexDirection="column"
                          >
                            <Typography fontWeight="bold">
                              {error.rule ?? "Regla desconocida"}
                            </Typography>
                            <Typography variant="body2">
                              {error.message} (línea {error.line ?? "-"}, columna{" "}
                              {error.column ?? "-"})
                            </Typography>
                          </Box>
                      ))}
                    </Alert>
                  </Box>
              )}

              {/* ÚNICO bloque de Output */}
              <Box pt={1} flex={1} marginTop={2}>
                <Alert severity="info">Output</Alert>
                <SnippetExecution snippetId={id} />
              </Box>
            </>
        )}

        <ShareSnippetModal
            loading={loadingShare || isLoading}
            open={shareModalOppened}
            onClose={() => setShareModalOppened(false)}
            onShare={handleShareSnippet}
        />
        <TestSnippetModal
            open={testModalOpened}
            onClose={() => setTestModalOpened(false)}
            snippet={snippet as SnippetDetails | undefined}
        />
        <DeleteConfirmationModal
            open={deleteConfirmationModalOpen}
            onClose={() => setDeleteConfirmationModalOpen(false)}
            id={snippet?.id ?? ""}
            setCloseDetails={handleCloseModal}
        />
      </Box>
  );
};
