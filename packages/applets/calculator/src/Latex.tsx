import React, {ReactNode, useLayoutEffect, useState} from "react";
import {Box, constGetter, IBoxProps, LFC} from "@launchmenu/core";
import {ClassNames} from "@emotion/react";
import Path from "path";
import FS from "fs";
import {renderToString} from "katex";
import {useFontFitter} from "./useFontFitter";

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

export const Latex: LFC<{latex: string; fallback?: ReactNode} & IBoxProps> = ({
    latex,
    fallback,
    ...rest
}) => {
    const [html, setHtml] = useState<string | undefined>();
    useLayoutEffect(() => {
        try {
            setHtml(renderToString(latex, {throwOnError: !!fallback}));
        } catch (e) {
            setHtml(undefined);
            console.error(e);
        }
    }, [latex]);

    const [boxRef, htmlRef] = useFontFitter();

    return (
        <ClassNames>
            {({css, cx}) => (
                <Box
                    elRef={[
                        boxRef,
                        ...(!rest.elRef
                            ? []
                            : !(rest.elRef instanceof Array)
                            ? [rest.elRef]
                            : rest.elRef),
                    ]}
                    {...rest}
                    className={
                        css(getKatexCss()) + (rest.className ? " " + rest.className : "")
                    }>
                    {html ? (
                        <span ref={htmlRef} dangerouslySetInnerHTML={{__html: html}} />
                    ) : (
                        fallback
                    )}
                </Box>
            )}
        </ClassNames>
    );
};

// fib(a) = a <= 1? a : fib(a-2) + fib(a-1)
