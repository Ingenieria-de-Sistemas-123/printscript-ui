import {withNavbar} from "../components/navbar/withNavbar.tsx";
import {SnippetTable} from "../components/snippet-table/SnippetTable.tsx";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {SnippetDetail} from "./SnippetDetail.tsx";
import {Drawer} from "@mui/material";
import {useGetSnippets} from "../utils/queries.tsx";
import {usePaginationContext} from "../contexts/paginationContext.tsx";
import useDebounce from "../hooks/useDebounce.ts";
import {usePermissionSync} from "../hooks/usePermissionSync.ts";
import {SnippetListFilters} from "../types/snippetDetails.ts";

const HomeScreen = () => {
  const { userAccount, loading, error } = usePermissionSync();
  const {id: paramsId} = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SnippetListFilters>({relation: 'all', sortBy: 'updated_at', sortDir: 'desc'});
  const [snippetId, setSnippetId] = useState<string | null>(null)
  const {page, page_size, count, handleChangeCount, handleGoToPage} = usePaginationContext()
  const {data, isLoading} = useGetSnippets(page, page_size, filters)

  console.log("[HomeScreen] userAccount:", userAccount, "loading:", loading, "error:", error);


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
        setFilters(prev => ({
          ...prev,
          name: searchTerm || undefined
        }));
        handleGoToPage(0);
      }, [searchTerm, handleGoToPage], 800
  );

  const handleSearchSnippet = (snippetName: string) => {
    setSearchTerm(snippetName);
  };

  const handleFiltersChange = (next: SnippetListFilters) => {
    setFilters(next);
    handleGoToPage(0);
  }

  return (
      <>
        <SnippetTable loading={isLoading} handleClickSnippet={setSnippetId} snippets={data?.snippets}
                      handleSearchSnippet={handleSearchSnippet} filters={filters} onChangeFilters={handleFiltersChange}/>
        <Drawer open={!!snippetId} anchor={"right"} onClose={handleCloseModal}>
          {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId}/>}
        </Drawer>
      </>
  )
}

export default withNavbar(HomeScreen);
