import React from "react";
import {Box} from "../../styling/box/Box";
import {LFC} from "../../_types/LFC";
import {AceEditor} from "../fields/editorField/AceEditor";

/** The markdown renderer for code blocks */
export const markdownSyntaxRenderer: LFC<{language: string; value: string}> = ({
    language,
    value,
}) => (
    <Box padding="small" background="bgPrimary">
        <AceEditor
            options={{
                mode: `ace/mode/${
                    markdownSyntaxRendererLanguageMap[
                        language as keyof typeof markdownSyntaxRendererLanguageMap
                    ] ?? language
                }`,
                readOnly: true,
                maxLines: Infinity,
                wrap: true,
                showGutter: false,
            }}
            css={{".ace_cursor-layer": {display: "none"}, background: "transparent"}}
            value={value}
        />
    </Box>
);

/** Abbreviations for languages names */
export const markdownSyntaxRendererLanguageMap = {
    js: "javascript",
    regex: "javascript",
    ts: "typescript",
};
