import {ComponentType} from "react";
import {Navbar} from "./Navbar.tsx";
import {Box} from "@mui/material";

export const withNavbar = (WrappedComponent: React.FC) => {
    return () => (
        <>
            <Navbar/>
            <Box padding={"16px 128px"}>
                <WrappedComponent/>
            </Box>
        </>
    );
};
