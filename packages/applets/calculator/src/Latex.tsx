import React, {Fragment, ReactNode, useLayoutEffect, useState} from "react";
import {constGetter, LFC} from "@launchmenu/core";
import {Global, css} from "@emotion/react";
import Path from "path";
import FS from "fs";
import {renderToString} from "katex";

/** A retriever for the latex css */
const getKatexCss = constGetter(() => {
    // Css is expected to be added using a linker such as webpack, so we will have to manually fix some stuff
    const cssPath = require.resolve("katex/dist/katex.min.css");
    const css = FS.readFileSync(cssPath, "utf8");
    const cssCorrectedFontPaths = css.replace(
        /url\(([^\)]*)\)/g,
        (match, path) => `url("${Path.join(cssPath, "..", path).replace(/\\/g, "/")}")`
    );
    return cssCorrectedFontPaths;
});

// TODO: add dynamic zoom to fit parent
export const Latex: LFC<{latex: string; fallback?: ReactNode}> = ({latex, fallback}) => {
    const [html, setHtml] = useState<string | undefined>();
    useLayoutEffect(() => {
        try {
            setHtml(renderToString(latex, {throwOnError: !!fallback}));
        } catch (e) {
            setHtml(undefined);
            console.error(e);
        }
    }, [latex]);

    return (
        <Fragment>
            <Global styles={css(getKatexCss())} />
            {html ? <span dangerouslySetInnerHTML={{__html: html}} /> : fallback}
        </Fragment>
    );
};
