import {createHighlightTokens} from "./utils/createHighlightTokens";
import {highlightTags} from "./utils/highlightTags";
import {HighlightLexer} from "./HighlightLexer";

export const {tokenList} = createHighlightTokens({
    text: {pattern: /(.|\n)+/, tags: [highlightTags.text]},
});

export let plaintextLexer = new HighlightLexer(tokenList);
