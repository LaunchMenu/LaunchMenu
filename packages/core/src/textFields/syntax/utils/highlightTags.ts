const tagsList = [
    "literal",
    "keyword",
    "variable",
    "property",
    "declaration",
    "operator",
    "bracket",
    "left",
    "right",
    "parameter",
    "string",
    "number",
    "boolean",
    "whiteSpace",
    "error",
    "empty",
    "text",
    "patternMatch",
    "searchHighlight",
    "darkBackground",
] as const;

/**
 * A collection of standard highlight tags
 */
export const highlightTags = {} as {[P in typeof tagsList[any]]: P};
tagsList.forEach(tag => ((highlightTags[tag] as any) = tag));
