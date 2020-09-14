import {MathParser, tokenList, tokens} from "./MathInterpreter.helper";
import {HighlightParser} from "../HighlightParser";
import {highlightTags} from "../utils/highlightTags";

// The highlight parsers largely relies on correctness of chevrotain, since it's only a light wrapper
describe("HighlightParser", () => {
    describe("new HighlightParser", () => {
        it("Correctly creates new parsers for valid grammars", () => {
            expect(() => new MathParser()).not.toThrow();
        });
        it("Warns about grammar definition errors", () => {
            class SomeParser extends HighlightParser<number> {
                constructor() {
                    super(tokenList);
                    this.performSelfAnalysis();
                }
                // Expression that is left recursive, which isn't allowed
                protected expression = this.RULE("expression", () => {
                    let result: number = this.SUBRULE(this.expression);
                    this.MANY(() => {
                        const {tokenType} = this.OR([
                            {ALT: () => this.CONSUME(tokens.add)}, //
                            {ALT: () => this.CONSUME(tokens.sub)},
                        ]);
                        const value = this.SUBRULE(this.expression);
                        result =
                            tokenType == tokens.add ? result + value : result - value;
                    });
                    return result;
                });
            }
            expect(() => new SomeParser()).toThrow();
        });
    });
    describe("HighlightParser.highlight", () => {
        let parser: MathParser;
        beforeEach(() => {
            parser = new MathParser();
        });
        it("Retrieves the data which can be used for syntax highlighting from the lexer", () => {
            const {nodes, errors} = parser.highlight("3*5");
            expect(nodes[0]).toEqual({
                text: "3",
                start: 0,
                end: 1,
                tags: [highlightTags.literal, highlightTags.number],
            });
            expect(nodes[1]).toEqual({
                text: "*",
                start: 1,
                end: 2,
                tags: [highlightTags.operator],
            });
            expect(nodes[2]).toEqual({
                text: "5",
                start: 2,
                end: 3,
                tags: [highlightTags.literal, highlightTags.number],
            });
            expect(nodes.length).toEqual(3);
            expect(errors.length).toEqual(0);
        });
        it("Retrieves tokenization errors", () => {
            const {nodes, errors} = parser.highlight("3*ye5");
            expect(errors.length).toEqual(1);
            expect(errors[0]).toMatchObject({
                syntaxRange: {start: 2, end: 4, text: "ye"},
            });
            expect(typeof errors[0].message).toEqual("string");
        });
        it("Retrieves grammar errors", () => {
            const {nodes, errors} = parser.highlight("3*)5");
            expect(errors.length).toEqual(1);
            expect(errors[0]).toMatchObject({
                syntaxRange: {start: 2, end: 3, text: ")"},
            });
            expect(typeof errors[0].message).toEqual("string");
        });
    });
    describe("HighlightParser.execute", () => {
        it("Uses the first defined rule by default", () => {
            const parser = new MathParser();
            const {result, errors} = parser.execute("4+4");
            expect(errors?.length).toBe(0);
            expect(result).toBe(8);
        });
        it("Uses the init rule if specified", () => {
            class SomeParser extends HighlightParser<number> {
                constructor() {
                    super(tokenList, {
                        startRule: "something2",
                    });
                    this.performSelfAnalysis();
                }

                // Expression that is left recursive, which isn't allowed
                protected something1 = this.RULE("something1", () => {
                    this.CONSUME(tokens.sub);
                    return 3;
                });
                protected something2 = this.RULE("something2", () => {
                    this.CONSUME(tokens.add);
                    return 3;
                });
            }

            const parser = new SomeParser();
            const {result, errors} = parser.execute("+");
            expect(errors?.length).toBe(0);
            expect(result).toBe(3);
        });
    });
});
