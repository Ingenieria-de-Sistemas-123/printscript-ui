import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {SnippetTable} from "../components/snippet-table/SnippetTable.tsx";
import {useParams} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {SnippetDetail} from "./SnippetDetail.tsx";
import {Drawer} from "@mui/material";
import {useGetSnippets} from "../utils/queries.tsx";
import {usePaginationContext} from "../contexts/paginationContext.tsx";
import useDebounce from "../hooks/useDebounce.ts";
import {SnippetListFilters} from "../types/snippetDetails.ts";

const HomeScreen = () => {
    const {id: paramsId} = useParams<{ id: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedName, setDebouncedName] = useState<string | undefined>(undefined);
    const [snippetId, setSnippetId] = useState<string | null>(null)
    const [filters, setFilters] = useState<SnippetListFilters>({
        relation: 'all',
        language: 'all',
        sortBy: 'updated_at',
        sortDir: 'desc'
    })
    const {page, page_size, count, handleChangeCount} = usePaginationContext()
    const filtersPayload = useMemo(() => {
        const payload: SnippetListFilters & { sortBy?: string; sortDir?: 'asc' | 'desc' } = {}
        if (debouncedName) payload.name = debouncedName
        if (filters.language && filters.language !== 'all') payload.language = filters.language
        if (filters.relation && filters.relation !== 'all') payload.relation = filters.relation
        if (typeof filters.valid === 'boolean') payload.valid = filters.valid
        if (filters.sortBy) payload.sortBy = filters.sortBy
        if (filters.sortDir) payload.sortDir = filters.sortDir
        return payload
    }, [debouncedName, filters])
    const {data, isLoading} = useGetSnippets(page, page_size, filtersPayload)

    useEffect(() => {
        if (data?.count && data.count != count) {
            handleChangeCount(data.count)
        }
    }, [count, data?.count, handleChangeCount]);


    useEffect(() => {
        if (paramsId) {
            setSnippetId(paramsId);
        }
    }, [paramsId]);

    const handleCloseModal = () => setSnippetId(null)

    // DeBounce Function
    useDebounce(() => {
            setDebouncedName(
                searchTerm || undefined
            );
        }, [searchTerm], 800
    );

    return (
        <>
            <SnippetTable
                loading={isLoading}
                handleClickSnippet={setSnippetId}
                snippets={data?.snippets}
                handleSearchSnippet={setSearchTerm}
                filters={filters}
                onChangeFilters={setFilters}
            />
            <Drawer open={!!snippetId} anchor={"right"} onClose={handleCloseModal}>
                {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId}/>}
            </Drawer>
        </>
    )
}

export default withNavbar(HomeScreen);
