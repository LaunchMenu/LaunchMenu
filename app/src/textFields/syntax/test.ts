import {createHighlightTokens} from "./utils/createHighightTokens";
import {HighlightLexer} from "./HighlightLexer";
import {HighlightParser, Lexer} from "./HighlightParser";
import {tags} from "./utils/standardTags";

const {tokens, tokenList} = createHighlightTokens({
    lBracket: {pattern: /\(/, tags: [tags.bracket, tags.left]},
    rBracket: {pattern: /\)/, tags: [tags.bracket, tags.right]},
    add: {pattern: /\+/, tags: [tags.operator]},
    sub: {pattern: /\-/, tags: [tags.operator]},
    mul: {pattern: /\*/, tags: [tags.operator]},
    div: {pattern: /\//, tags: [tags.operator]},
    value: {pattern: /[0-9]+/, tags: [tags.literal, tags.number]},
    whiteSpace: {
        pattern: /\s+/,
        tags: [tags.whiteSpace],
        group: Lexer.SKIPPED,
    },
});

let lexer = new HighlightLexer(tokenList);

class MathParser extends HighlightParser<number> {
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
            result = tokenType == tokens.mul ? result * value : result + value;
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
export const parser = new MathParser();

export function doStuff() {
    const inp = "(3 + 5) * 2";
    const {nodes, errors: highlightErrors} = parser.highlight(inp);
    const {result, errors: executeErrors} = parser.execute(inp);
    console.log(result, nodes);
}
