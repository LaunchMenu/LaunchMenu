import {createHighlightTokens} from "./utils/createHighightTokens";
import {tags} from "./utils/standardTags";
import {HighlightLexer} from "./HighlightLexer";

export const {tokenList} = createHighlightTokens({
    text: {pattern: /(.|\n)+/, tags: [tags.text]},
});

export let textLexer = new HighlightLexer(tokenList);
