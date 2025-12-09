import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {SnippetTable} from "../components/snippet-table/SnippetTable.tsx";
import {useParams} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {SnippetDetail} from "./SnippetDetail.tsx";
import {Drawer} from "@mui/material";
import {useGetSnippets} from "../utils/queries.tsx";
import {usePaginationContext} from "../contexts/paginationContext.tsx";
import useDebounce from "../hooks/useDebounce.ts";
import {SnippetTableFilters} from "../components/snippet-table/SnippetTable.tsx";
import {SnippetListFilters} from "../types/snippetDetails.ts";

const HomeScreen = () => {
    const {id: paramsId} = useParams<{ id: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedName, setDebouncedName] = useState<string | undefined>(undefined);
    const [snippetId, setSnippetId] = useState<string | null>(null)
    const [tableFilters, setTableFilters] = useState<SnippetTableFilters>({
        relation: 'all',
        language: 'all',
        validity: 'all',
        sortBy: 'name',
        sortDir: 'asc'
    })
    const {page, page_size, count, handleChangeCount} = usePaginationContext()
    const filtersPayload = useMemo(() => {
        const payload: SnippetListFilters & { sortBy?: string; sortDir?: 'asc' | 'desc' } = {}
        if (debouncedName) payload.name = debouncedName
        if (tableFilters.language !== 'all') payload.language = tableFilters.language
        if (tableFilters.relation !== 'all') payload.relation = tableFilters.relation
        if (tableFilters.validity !== 'all') payload.valid = tableFilters.validity === 'valid'
        if (tableFilters.sortBy) payload.sortBy = tableFilters.sortBy
        if (tableFilters.sortDir) payload.sortDir = tableFilters.sortDir
        return payload
    }, [debouncedName, tableFilters])
    const serializedFilters = useMemo(() => {
        const entries = Object.entries(filtersPayload).filter(([, value]) => value !== undefined && value !== null)
        if (!entries.length) return undefined
        return JSON.stringify(Object.fromEntries(entries))
    }, [filtersPayload])
    const {data, isLoading} = useGetSnippets(page, page_size, serializedFilters)

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

    const handleFilterChange = (updates: Partial<SnippetTableFilters>) => {
        setTableFilters(prev => ({...prev, ...updates}))
    }

    return (
        <>
            <SnippetTable loading={isLoading} handleClickSnippet={setSnippetId} snippets={data?.snippets}
                          searchValue={searchTerm} onSearchChange={setSearchTerm} filters={tableFilters}
                          onFilterChange={handleFilterChange}/>
            <Drawer open={!!snippetId} anchor={"right"} onClose={handleCloseModal}>
                {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId}/>}
            </Drawer>
        </>
    )
}

export default withNavbar(HomeScreen);
