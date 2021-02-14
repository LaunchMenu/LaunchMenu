import {Box, CenteredLoader, constGetter, LFC} from "@launchmenu/core";
import React from "react";
import {Note} from "../../dataModel/Note";
import Path from "path";
import IframeResizer from "iframe-resizer-react";

/** The content to render a note's content as html */
export const ContentHtml: LFC<{note: Note}> = ({note}) => {
    return (
        <CenteredLoader>
            {h => {
                const src = `<script src="${Path.join(
                    require.resolve("iframe-resizer"),
                    "..",
                    "js",
                    "iframeResizer.contentWindow.min.js"
                )}"></script> 
                <style>html {
                    /* 14 is the default font size */
                    zoom: ${note.getFontSize(h) / 14}
                }</style>
                ${note.getText(h)}`;
                return (
                    <IframeResizer
                        srcDoc={src}
                        checkOrigin={false}
                        style={{
                            width: "100%",
                            minHeight: "100%",
                            display: "block",
                        }}
                        width="100%"
                        scrolling={false}
                        frameBorder="0"
                        sandbox="allow-modals allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation allow-downloads"
                    />
                );
            }}
        </CenteredLoader>
    );
};
