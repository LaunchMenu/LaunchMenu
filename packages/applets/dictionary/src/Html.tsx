import {LFC} from "@launchmenu/core";
import React from "react";
import sanitizeHtml from "sanitize-html";

const defaultOptions: sanitizeHtml.IOptions = {
    allowedTags: ["b", "i", "em", "strong", "a"],
    allowedAttributes: {
        a: ["href"],
    },
    allowedIframeHostnames: ["www.youtube.com"],
    transformTags: {
        a: (tagName, attributes) => {
            const baseHref = attributes.href;
            const href = baseHref.match(/^https?:\/\//i)
                ? baseHref
                : `https://en.wiktionary.org/${baseHref}`;
            return {tagName, attribs: {...attributes, href}};
        },
    },
};

/** An element that allows for html string contents. Performs sanitization for safety */
export const Html: LFC<{
    content: string;
    /** Sanitization options */
    options?: sanitizeHtml.IOptions;
}> = ({content, options}) => (
    <div
        dangerouslySetInnerHTML={{
            __html: sanitizeHtml(content, {...defaultOptions, ...options}),
        }}
    />
);
