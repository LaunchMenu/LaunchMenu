import {EditorField, ITextField, LFC, CenteredLoader} from "@launchmenu/core";
import React, {useMemo} from "react";
import {Field} from "model-react";
import {Note} from "../../dataModel/Note";

/** The content to render a note's content using a syntax editor */
export const ContentSyntaxEditor: LFC<{note: Note}> = ({note}) => {
    const field = useMemo<ITextField>(() => {
        const selection = new Field({start: -1, end: -1});
        return {
            set: text => note.setText(text),
            get: h => note.getText(h),
            setSelection: sel => selection.set(sel),
            getSelection: h => selection.get(h),
        };
    }, [note]);

    return (
        <CenteredLoader>
            {h => {
                // Set loading state
                note.getText(h);

                return (
                    <EditorField
                        field={field}
                        css={{
                            ".ace_hidden-cursors": {
                                opacity: 0,
                            },
                            minHeight: "100%",
                        }}
                        options={{
                            wrap: true,
                            fontSize: note.getFontSize(h),
                            mode: `ace/mode/${note.getSyntaxMode(h).toLowerCase()}`,
                            maxLines: Infinity,
                        }}
                    />
                );
            }}
        </CenteredLoader>
    );
};
