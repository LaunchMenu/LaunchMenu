import {EmbeddedActionsParser, IRecognitionException, ILexingError} from "chevrotain";
import {IHighlighter} from "./_types/IHighlighter";
import {IHighlightMultiModeLexerDefinition} from "./_types/IHighlightMultiModeLexerDefinition";
import {IHighlightTokenType} from "./_types/IHighlightTokenType";
import {HighlightLexer} from "./HighlightLexer";
import {IHighlightNode} from "./_types/IHighlightNode";
import {IHighlightError} from "./_types/IHighlightError";
import {IHighlightParserConfig} from "./_types/IHighlightParserConfig";

export * from "chevrotain";

export abstract class HighlightParser<T>
    extends EmbeddedActionsParser
    implements IHighlighter {
    protected lexer: HighlightLexer;
    protected config: IHighlightParserConfig | undefined;

    /**
     * Creates a new highlight parser
     * @param vocabulary A data structure containing all the Tokens used by the Parser.
     * @param config The parser's configuration
     */
    public constructor(
        vocabulary: IHighlightTokenType[] | IHighlightMultiModeLexerDefinition,
        config?: IHighlightParserConfig
    ) {
        super(vocabulary, config);
        this.lexer = new HighlightLexer(vocabulary, config);
        this.config = config;
    }

    /**
     * Extracts the highlight data from the given syntax
     * @param syntax The syntax to highlight
     * @returns The highlight nodes and possibly syntax and or semantic errors
     */
    public highlight(
        syntax: string
    ): {nodes: IHighlightNode[]; errors: IHighlightError[]} {
        const {nodes} = this.lexer.highlight(syntax);
        const {errors} = this.execute(syntax);
        return {
            nodes,
            errors:
                errors?.map(error => {
                    if ("token" in error) return HighlightParser.mapError(syntax, error);
                    else return HighlightLexer.mapError(syntax, error);
                }) || [],
        };
    }

    /**
     * Maps a recognition error to a highlight error
     * @param syntax The syntax the error corresponds to
     * @param error The error to map
     * @returns The highlight error
     */
    public static mapError(
        syntax: string,
        {message, name, token}: IRecognitionException
    ): IHighlightError {
        let range = {
            start: token.startOffset,
            end: token.endOffset
                ? token.endOffset + 1
                : token.startOffset + token.image.length,
            text: token.image,
        };
        if (token.tokenType.name == "EOF") {
            range = {
                start: syntax.length,
                end: syntax.length,
                text: "",
            };
        }
        return {
            message: message,
            type: name,
            syntaxRange: range,
        };
    }

    /**
     * Executes the parser and retrieves the result
     * @param syntax The syntax to be parsed
     * @returns The parsing result or possibly an error
     */
    public execute(
        syntax: string
    ):
        | {errors: undefined; result: T}
        | {errors: (IRecognitionException | ILexingError)[]; result: T | undefined} {
        const {errors: lexicalErrors, tokens} = this.lexer.tokenize(syntax);

        this.input = tokens;
        const startExpression =
            this.config?.startRule || (this as any).definedRulesNames[0];
        const result: T | undefined = (this as any)[startExpression]();

        return {errors: [...lexicalErrors, ...this.errors], result};
    }
}
