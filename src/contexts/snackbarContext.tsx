import {createContext, useContext} from 'react'
import {AlertColor} from "@mui/material";

export type SnackBarType  = {
    severity: AlertColor,
    text: string
}

export type SnackbarContextType = {
    active: SnackBarType[],
    createSnackbar: (severity: AlertColor, text: string) => void
}


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const SnackbarContext = createContext<SnackbarContextType>(null)

export const useSnackbarContext = (): SnackbarContextType => useContext(SnackbarContext)