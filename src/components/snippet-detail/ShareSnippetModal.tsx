import {Autocomplete, Box, Button, Divider, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetUsers} from "../../utils/queries.tsx";
import {useEffect, useState} from "react";
import {Friends} from "../../utils/users.ts";
import useDebounce from "../../hooks/useDebounce";

type ShareSnippetModalProps = {
    open: boolean
    onClose: () => void
    onShare: (userId: string) => void
    loading: boolean
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, onShare, loading} = props
  const [name, setName] = useState("")
  const {data: users = [], isLoading} = useGetUsers()
  const [selectedUser, setSelectedUser] = useState<Friends | undefined>()
  const [options, setOptions] = useState<Friends[]>([])

  // debounce: filtrar en frontend tras 300ms desde la última tecla
  useDebounce(() => {
    if (!name) {
      setOptions(users)
      return
    }
    const q = name.toLowerCase()
    setOptions(
      users.filter((u) =>
        (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
      )
    )
  }, [name, users], 300)

  // sincronizar opciones inicialmente cuando cambian los usuarios traídos
  useEffect(() => {
    setOptions(users)
  }, [users])

  function handleSelectUser(newValue: Friends | null) {
    newValue ? setSelectedUser(newValue) : setSelectedUser(undefined)
  }

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2}>
          <Autocomplete
              renderInput={(params) => <TextField {...params} label="Type the user's name"/>}
              options={options}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name}
              loading={isLoading}
              value={selectedUser}
              onInputChange={(_: unknown, newValue: string | null) => setName(newValue ?? "")}
              onChange={(_: unknown, newValue: Friends | null) => handleSelectUser(newValue)}
          />
          <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            <Button disabled={!selectedUser || loading} onClick={() => selectedUser && onShare(selectedUser?.id)} sx={{marginLeft: 2}} variant={"contained"}>Share</Button>
          </Box>
        </Box>
      </ModalWrapper>
  )
}
