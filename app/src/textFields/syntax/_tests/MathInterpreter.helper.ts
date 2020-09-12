import {createHighlightTokens} from "../utils/createHighlightTokens";
import {HighlightParser, Lexer} from "../HighlightParser";
import {highlightTags} from "../utils/highlightTags";

export const {tokens, tokenList} = createHighlightTokens({
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

export class MathParser extends HighlightParser<number> {
    constructor() {
        super(tokenList);
        this.performSelfAnalysis();
    }

    protected expression = this.RULE("expression", () => {
        let result: number = this.SUBRULE(this.term);
        this.MANY(() => {
            const {tokenType} = this.OR([
                {ALT: () => this.CONSUME(tokens.add)}, //
                {ALT: () => this.CONSUME(tokens.sub)},
            ]);
            const value = this.SUBRULE2(this.term);
            result = tokenType == tokens.add ? result + value : result - value;
        });
        return result;
    });
    protected term = this.RULE("term", () => {
        let result = this.SUBRULE(this.factor);
        this.MANY(() => {
            const {tokenType} = this.OR([
                {ALT: () => this.CONSUME(tokens.mul)}, //
                {ALT: () => this.CONSUME(tokens.div)},
            ]);
            const value = this.SUBRULE2(this.factor);
            result = tokenType == tokens.mul ? result * value : result / value;
        });
        return result;
    });
    protected factor = this.RULE("factor", () =>
        this.OR([
            {
                ALT: () => {
                    this.CONSUME(tokens.lBracket);
                    const value = this.SUBRULE(this.expression);
                    this.CONSUME(tokens.rBracket);
                    return value;
                },
            },
            {
                ALT: () => {
                    const {image} = this.CONSUME(tokens.value);
                    return parseInt(image);
                },
            },
        ])
    );
}
