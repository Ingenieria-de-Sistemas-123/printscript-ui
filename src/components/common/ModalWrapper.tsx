import {Box, Modal} from "@mui/material";
import {ReactNode} from "react";

export const ModalWrapper = ({open, onClose,children}: { open: boolean, onClose: () => void, children: ReactNode }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
            <Box sx={{
                backgroundColor: 'white',
                p: {xs: 2, sm: 4},
                borderRadius: '8px',
                width: {xs: '90%', sm: '80%', md: '60%', lg: '50%'},
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxSizing: 'border-box'
            }}>
                {children}
            </Box>
        </Modal>
    )
}
