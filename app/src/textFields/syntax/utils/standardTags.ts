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
] as const;

/**
 * A collection of standard
 */
export const tags = {} as {[P in typeof tagsList[any]]: P};
tagsList.forEach(tag => ((tags[tag] as any) = tag));
