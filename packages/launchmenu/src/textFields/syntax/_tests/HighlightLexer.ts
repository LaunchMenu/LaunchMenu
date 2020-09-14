import {HighlightLexer} from "../HighlightLexer";
import {highlightTags} from "../utils/highlightTags";
import {tokenList} from "./MathInterpreter.helper";

describe("HighlightLexer", () => {
    describe("new HighlightLexer", () => {
        it("Doesn't error on valid token collections", () => {
            expect(() => new HighlightLexer(tokenList)).not.toThrow();
        });
    });
    describe("HighlightLexer.getHighlightData", () => {
        let lexer: HighlightLexer;
        beforeEach(() => {
            lexer = new HighlightLexer(tokenList);
        });
        it("Retrieves the data which can be used for syntax highlighting", () => {
            const {tokens, errors} = lexer.getHighlightData("3*5");
            expect(tokens[0]).toMatchObject({
                image: "3",
                startOffset: 0,
                endOffset: 0,
                tags: [highlightTags.literal, highlightTags.number],
            });
            expect(tokens[1]).toMatchObject({
                image: "*",
                startOffset: 1,
                endOffset: 1,
                tags: [highlightTags.operator],
            });
            expect(tokens[2]).toMatchObject({
                image: "5",
                startOffset: 2,
                endOffset: 2,
                tags: [highlightTags.literal, highlightTags.number],
            });
            expect(tokens.length).toEqual(3);
            expect(errors.length).toEqual(0);
        });
        it("Retrieves errors for text that can't be tokenized", () => {
            const {tokens, errors} = lexer.getHighlightData("3*ye5");
            expect(errors.length).toEqual(1);
            expect(errors[0]).toMatchObject({offset: 2, length: 2, line: 1});
            expect(typeof errors[0].message).toEqual("string");
        });
        it("Includes skipped token groups", () => {
            const {tokens, errors} = lexer.getHighlightData("3 *");
            expect(tokens[0]).toMatchObject({
                image: "3",
                startOffset: 0,
                endOffset: 0,
                tags: [highlightTags.literal, highlightTags.number],
            });
            expect(tokens[1]).toMatchObject({
                image: " ",
                startOffset: 1,
                endOffset: 1,
                tags: [highlightTags.whiteSpace],
            });
            expect(tokens[2]).toMatchObject({
                image: "*",
                startOffset: 2,
                endOffset: 2,
                tags: [highlightTags.operator],
            });
            expect(tokens.length).toEqual(3);
            expect(errors.length).toEqual(0);
        });
    });
    describe("HighlightLexer.highlight", () => {
        let lexer: HighlightLexer;
        beforeEach(() => {
            lexer = new HighlightLexer(tokenList);
        });
        it("Retrieves syntax highlight data according to the highlighter interface", () => {
            const {nodes, errors} = lexer.highlight("3*5");
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
        it("Retrieves errors for text that can't be matched according to the highlighter interface", () => {
            const {nodes, errors} = lexer.highlight("3*ye5");
            expect(errors.length).toEqual(1);
            expect(errors[0]).toMatchObject({
                syntaxRange: {start: 2, end: 4, text: "ye"},
            });
            expect(typeof errors[0].message).toEqual("string");
        });
        it("Includes skipped token groups", () => {
            const {nodes, errors} = lexer.highlight("3 *");
            expect(nodes[0]).toEqual({
                text: "3",
                start: 0,
                end: 1,
                tags: [highlightTags.literal, highlightTags.number],
            });
            expect(nodes[1]).toEqual({
                text: " ",
                start: 1,
                end: 2,
                tags: [highlightTags.whiteSpace],
            });
            expect(nodes[2]).toEqual({
                text: "*",
                start: 2,
                end: 3,
                tags: [highlightTags.operator],
            });
            expect(nodes.length).toEqual(3);
            expect(errors.length).toEqual(0);
        });
    });
    describe("HighlightLexer.tokenize", () => {
        let lexer: HighlightLexer;
        beforeEach(() => {
            lexer = new HighlightLexer(tokenList);
        });
        it("Retrieves token data without tags", () => {
            const {tokens, errors} = lexer.tokenize("3*5");
            expect(tokens[0]).toMatchObject({
                image: "3",
                startOffset: 0,
                endOffset: 0,
            });
            expect(tokens[1]).toMatchObject({
                image: "*",
                startOffset: 1,
                endOffset: 1,
            });
            expect(tokens[2]).toMatchObject({
                image: "5",
                startOffset: 2,
                endOffset: 2,
            });
            expect(tokens.length).toEqual(3);
            expect(errors.length).toEqual(0);
        });
        it("Retrieves errors for text that can't be tokenized", () => {
            const {tokens, errors} = lexer.tokenize("3*ye5");
            expect(errors.length).toEqual(1);
            expect(errors[0]).toMatchObject({offset: 2, length: 2, line: 1});
            expect(typeof errors[0].message).toEqual("string");
        });
        it("Doesn't include skipped token groups", () => {
            const {tokens, errors} = lexer.tokenize("3 *");
            expect(tokens[0]).toMatchObject({
                image: "3",
                startOffset: 0,
                endOffset: 0,
            });
            expect(tokens[1]).toMatchObject({
                image: "*",
                startOffset: 2,
                endOffset: 2,
            });
            expect(tokens.length).toEqual(2);
            expect(errors.length).toEqual(0);
        });
    });
});
