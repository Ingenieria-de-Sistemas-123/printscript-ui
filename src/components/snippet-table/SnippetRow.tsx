import {alpha, Skeleton, styled, TableRow, TableRowProps} from "@mui/material";
import {StyledTableCell} from "./SnippetTable.tsx";
import {Snippet} from "../../utils/snippet.ts";
import {SnippetRelation} from "../../types/snippetDetails.ts";

const StyledTableRow = styled(TableRow)(({theme}) => ({
    backgroundColor: 'white',
    border: 0,
    height: '75px',
    cursor: 'pointer',
    '& td': {
        borderTop: '2px solid transparent',
        borderBottom: '2px solid transparent',
    },
    '& td:first-of-type': {
        borderLeft: '2px solid transparent',
        borderTopLeftRadius: theme.shape.borderRadius,
        borderBottomLeftRadius: theme.shape.borderRadius,
    },
    '& td:last-of-type': {
        borderRight: '2px solid transparent',
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    '&:hover > td': {
        borderTop: `2px ${theme.palette.primary.light} solid`,
        borderBottom: `2px ${theme.palette.primary.light} solid`,
        backgroundColor: alpha(theme.palette.primary.light, 0.2)
    },
    '&:hover > td:first-of-type': {
        borderLeft: `2px ${theme.palette.primary.light} solid`,
    },
    '&:hover > td:last-of-type': {
        borderRight: `2px ${theme.palette.primary.light} solid`
    },
}));


type SnippetRowData = Snippet & { relation?: SnippetRelation }

const relationLabel = (relation?: SnippetRelation) => {
    if (relation === "OWNER") return "Owned"
    if (relation === "SHARED") return "Shared"
    return "Unknown"
}

export const SnippetRow = ({snippet, onClick, ...props}: { snippet: SnippetRowData, onClick: () => void } & TableRowProps) => {
    return (
        <StyledTableRow onClick={onClick} sx={{backgroundColor: 'white', border: 0, height: '75px'}} {...props}>
            <StyledTableCell>{snippet.name}</StyledTableCell>
            <StyledTableCell>{snippet.language}</StyledTableCell>
            <StyledTableCell>{snippet.author}</StyledTableCell>
            <StyledTableCell>{relationLabel(snippet.relation as SnippetRelation)}</StyledTableCell>
            <StyledTableCell>{snippet.compliance}</StyledTableCell>
        </StyledTableRow>
    )
}

export const LoadingSnippetRow = () => {
    return (
        <TableRow sx={{height: '75px', padding: 0}}>
            <StyledTableCell colSpan={5} sx={{
                padding: 0
            }}>
                <Skeleton height={"75px"} width={"100%"} variant={"rectangular"}/>
            </StyledTableCell>
        </TableRow>
    )
}
