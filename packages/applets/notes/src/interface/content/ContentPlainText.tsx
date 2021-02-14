import {Box, CenteredLoader, LFC} from "@launchmenu/core";
import React from "react";
import {Note} from "../../dataModel/Note";

/** The content to render a note's content as plain text */
export const ContentPlainText: LFC<{note: Note}> = ({note}) => {
    return (
        <CenteredLoader>
            {h => {
                // Set loading state
                note.getText(h);

                return (
                    <Box padding="medium" css={{fontSize: note.getFontSize(h)}}>
                        {note
                            .getText(h)
                            .split(/\n/)
                            .flatMap((line, i) => [<br key={i} />, line])
                            .slice(1)}
                    </Box>
                );
            }}
        </CenteredLoader>
    );
};
