import {Box, CenteredLoader, LFC, ReactMarkdown} from "@launchmenu/core";
import React from "react";
import {Note} from "../../dataModel/Note";

/** The content to render a note's content as markdown */
export const ContentMarkdown: LFC<{note: Note}> = ({note}) => {
    return (
        <CenteredLoader>
            {h => (
                <Box
                    paddingX="medium"
                    css={{
                        zoom:
                            // 14 is the default font size
                            note.getFontSize(h) / 14,
                    }}>
                    <ReactMarkdown children={note.getText(h)} />
                </Box>
            )}
        </CenteredLoader>
    );
};
