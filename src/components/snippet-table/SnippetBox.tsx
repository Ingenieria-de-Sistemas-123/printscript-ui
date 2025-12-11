import {ReactNode, useEffect, useState} from "react";
import {Box, BoxProps} from "@mui/material";

type SnippetBoxProps = {
  code: string;
  children?: ReactNode;
} & BoxProps;

const SnippetBox = (props: SnippetBoxProps) => {
  const {code, children, ...boxProps} = props;
  const [showBox, setShowBox] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (code.includes("snake_case_variable")) {
        setShowBox(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [code]);

  return (
      <Box {...boxProps}>
        {showBox ? (
            <></> // Add easter egg here
        ) : (
            children
        )}
      </Box>
  );
};

export const Bòx = SnippetBox;
