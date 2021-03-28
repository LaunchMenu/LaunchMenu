import {
    createContextAction,
    createHighlightTokens,
    executeAction,
    HighlightLexer,
    highlightTags,
    IExecuteArg,
    IField,
    promptInputExecuteHandler,
    Priority,
    ReactMarkdown,
} from "@launchmenu/core";
import React from "react";

/**
 * An action to edit a search pattern
 */
export const setSearchPatternAction = createContextAction({
    name: "Set search pattern",
    contextItem: {
        icon: "edit",
        name: "Set search pattern",
        priority: [Priority.MEDIUM, Priority.MEDIUM - 7],
        content: (
            <ReactMarkdown>{`
Edits a search pattern, which can be 1 of three things:
- Disabled: Enter only white spaces
- A prefix: Enter normal text
- Regex: Enter a regular expression between \`/\` characters. E.g. 

    \`\`\`regex
    /^word\\s*:/
    \`\`\`

When regex is used, any non match text will be used as the search text. In addition capture groups prefixed with \`t_\` in order to also be considered text. E.g. a pattern to only match words prefixed with 'word':
\`\`\`regex
/^word\\s*:\\s*(?<t_smth>\w+)$/
\`\`\`
or prefixed with \`c_\` followed by a css color for highlighting. E.g.:
\`\`\`regex
/^(?<c_f0f>test)\s*:/
\`\`\`

            `}</ReactMarkdown>
        ),
    },
    core: (fields: IField<string>[]) => {
        const getExecuteBindings = () =>
            fields.map(field =>
                promptInputExecuteHandler.createBinding({
                    field,
                    highlighter: regexTokenizer,
                })
            );

        return {
            // Return the bindings for executing the action in the menu
            actionBindings: getExecuteBindings,
            // As well as some result for programmatic access for extension
            result: {
                execute: ({context}: IExecuteArg) =>
                    executeAction.execute(context, [
                        {actionBindings: getExecuteBindings()},
                    ]),
                getInputBindings: getExecuteBindings,
            },
        };
    },
});

/**
 * The regex tokenizer, but only if started with '/'
 * multigroup lexer: https://github.com/SAP/chevrotain/blob/master/examples/lexer/multi_mode_lexer/multi_mode_lexer.js
 */
export const regexTokenizer = new HighlightLexer({
    defaultMode: "unknown",
    modes: {
        unknown: createHighlightTokens({
            regexStart: {
                pattern: /\//,
                tags: [highlightTags.operator],
                push_mode: "regex",
            },
            textStart: {pattern: /./, tags: [], push_mode: "text"},
        }).tokenList,
        // The regex matcher
        regex: createHighlightTokens({
            group: {
                pattern: /\(|\)/,
                tags: [highlightTags.bracket, highlightTags.keyword],
            },
            bracket: {
                pattern: /\<|\>|\[|\]|\{|\}/,
                tags: [highlightTags.bracket, highlightTags.literal],
            },
            operator: {
                pattern: /\*|\+|\?|\||\!|\$|\^|\//,
                tags: [highlightTags.operator],
            },
            charType: {pattern: /\\\w/, tags: ["charType"]},
            words: {pattern: /./, tags: ["word"]},
        }).tokenList,
        // The literal matcher
        text: createHighlightTokens({
            text: {pattern: /./, tags: []},
        }).tokenList,
    },
});

// TODO: create a regex grammar in order to highligh syntax errors
