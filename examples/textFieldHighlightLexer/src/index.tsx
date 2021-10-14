import {
    createHighlightTokens,
    createSettings,
    createSettingsFolder,
    declare,
    HighlightLexer,
    highlightTags,
    Menu,
    TextField,
    UILayer,
} from "@launchmenu/core";
import {Lexer} from "chevrotain";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const {tokenList} = createHighlightTokens({
    lBracket: {pattern: /\(/, tags: [highlightTags.bracket, highlightTags.left]},
    rBracket: {pattern: /\)/, tags: [highlightTags.bracket, highlightTags.right]},
    add: {pattern: /\+/, tags: [highlightTags.operator]},
    sub: {pattern: /\-/, tags: [highlightTags.operator]},
    mul: {pattern: /\*/, tags: [highlightTags.operator]},
    div: {pattern: /\//, tags: [highlightTags.operator]},
    value: {pattern: /[0-9]+/, tags: [highlightTags.literal, highlightTags.number]},
    whiteSpace: {
        pattern: /\s+/,
        tags: [highlightTags.whiteSpace],
        group: Lexer.SKIPPED,
    },
});

export default declare({
    info,
    settings,
    open({context, onClose}) {
        const field = new TextField();
        context.open(
            new UILayer(
                () => ({
                    field,
                    highlighter: new HighlightLexer(tokenList),
                    handleClose: true,
                }),
                {
                    path: "Example",
                }
            )
        );
    },
});
