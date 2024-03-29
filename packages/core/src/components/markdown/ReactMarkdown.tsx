import React from "react";
import {constGetter} from "../../utils/constGetter";
import RemarkMathPlugin from "remark-math";
import FS from "fs";
import {LFC} from "../../_types/LFC";
import Path from "path";
import {ClassNames} from "@emotion/react";
import {markdownSyntaxRenderer} from "./markdownSyntaxRenderer";
const {InlineMath, BlockMath} = require("react-katex"); // No ts available, and too lazy to make declarations

// Simply reexport all of react markdown, since it will be useful for many applets
// And allows us to augment things by wrapping the main component and adding plugins
import ReactMarkdownOr, {
    AlignType as AlignTypeOr,
    AllowDangerousHtmlProp as AllowDangerousHtmlPropOr,
    AllowedTypesProp as AllowedTypesPropOr,
    ChildrenProp as ChildrenPropOr,
    DisallowedTypesProp as DisallowedTypesPropOr,
    EscapeHtmlProp as EscapeHtmlPropOr,
    LinkTargetResolver as LinkTargetResolverOr,
    NodeType as NodeTypeOr,
    Point as PointOr,
    Position as PositionOr,
    ReactMarkdownProps as ReactMarkdownPropsOr,
    ReactMarkdownPropsBase as ReactMarkdownPropsBaseOr,
    ReferenceType as ReferenceTypeOr,
    Renderer as RendererOr,
    Renderers as RenderersOr,
    SkipHtmlProp as SkipHtmlPropOr,
    SourceProp as SourcePropOr,
    renderers as renderersOr,
    types as typesOr,
} from "react-markdown";

/** Re export the namespace */
export namespace IReactMarkdown {
    export type AlignType = AlignTypeOr;
    export type AllowDangerousHtmlProp = AllowDangerousHtmlPropOr;
    export type AllowedTypesProp = AllowedTypesPropOr;
    export type ChildrenProp = ChildrenPropOr;
    export type DisallowedTypesProp = DisallowedTypesPropOr;
    export type EscapeHtmlProp = EscapeHtmlPropOr;
    export type LinkTargetResolver = LinkTargetResolverOr;
    export type NodeType = NodeTypeOr;
    export type Point = PointOr;
    export type Position = PositionOr;
    export type ReactMarkdownProps = ReactMarkdownPropsOr;
    export type ReactMarkdownPropsBase = ReactMarkdownPropsBaseOr;
    export type ReferenceType = ReferenceTypeOr;
    export type Renderer<T> = RendererOr<T>;
    export type Renderers = RenderersOr;
    export type SkipHtmlProp = SkipHtmlPropOr;
    export type SourceProp = SourcePropOr;
    export const renderers = renderersOr;
    export const types = typesOr;
}

const mathRenderer: LFC<{value: string}> = ({value}) => (
    <ClassNames>
        {({css, cx}) => (
            <div className={css(getKatexCss())}>
                <BlockMath children={value} />
            </div>
        )}
    </ClassNames>
);
const inlineMathRenderer: LFC<{value: string}> = ({value}) => (
    <ClassNames>
        {({css, cx}) => (
            <span className={css(getKatexCss())}>
                <InlineMath children={value} />
            </span>
        )}
    </ClassNames>
);
const autoFitImageRenderer: LFC<{
    alt?: string;
    src?: string;
    title?: string;
}> = ({alt, src, title}) => (
    <img alt={alt} src={src} title={title} style={{maxWidth: "100%"}} />
);

/**
 * A slightly augmented markdown renderer component
 */
export const ReactMarkdown: LFC<
    ReactMarkdownPropsOr & {
        /** Whether to auto scale the image to fit the available size */
        autoFitImages?: boolean;
        /** Whether to render latex formulas */
        allowLatex?: boolean;
    }
> = ({autoFitImages = true, allowLatex = true, renderers, plugins = [], ...props}) => {
    const markdown = (
        <ReactMarkdownOr
            {...props}
            plugins={[...(allowLatex ? [RemarkMathPlugin] : []), ...plugins]}
            renderers={{
                code: markdownSyntaxRenderer,
                ...(autoFitImages && {image: autoFitImageRenderer}),
                ...(allowLatex && {math: mathRenderer, inlineMath: inlineMathRenderer}),
                ...renderers,
            }}
        />
    );

    return markdown;
};

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
