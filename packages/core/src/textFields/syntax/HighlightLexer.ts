import {Lexer, ILexerConfig, ILexingError} from "chevrotain";
import {IHighlightMultiModeLexerDefinition} from "./_types/IHighlightMultiModeLexerDefinition";
import {IHighlightTokenType} from "./_types/IHighlightTokenType";
import {IHighlightToken} from "./_types/IHighlightToken";
import {IHighlighter} from "./_types/IHighlighter";
import {IHighlightNode} from "./_types/IHighlightNode";
import {IHighlightError} from "./_types/IHighlightError";

export class HighlightLexer extends Lexer implements IHighlighter {
    protected highlightLexer: Lexer;

    /**
     * Creates a new highlight lexer
     * @param lexerDefinition -
     *  Structure composed of Tokens Types this lexer will identify.
     *
     *  In the simple case the structure is an array of TokenTypes.
     *  In the case of `IHighlightMultiModeLexerDefinition` the structure is an object with two properties:
     *    1. a "modes" property where each value is an array of TokenTypes.
     *    2. a "defaultMode" property specifying the initial lexer mode.
     *
     *  for example:
     *
     *  ```
     *    {
     *        modes : {
     *          modeX : [Token1, Token2],
     *          modeY : [Token3, Token4]
     *        },
     *
     *        defaultMode : "modeY"
     *    }
     *  ```
     *
     *  A lexer with `IHighlightMultiModesDefinition` is simply multiple Lexers where only one Lexer(mode) can be active at the same time.
     *  This is useful for lexing languages where there are different lexing rules depending on context.
     *
     *  The current lexing mode is selected via a "mode stack".
     *  The last (peek) value in the stack will be the current mode of the lexer.
     *  Defining entering and exiting lexer modes is done using the "push_mode" and "pop_mode" properties
     *  of the `config` parameter.
     *
     *  - The Lexer will match the **first** pattern that matches, Therefor the order of Token Types is significant.
     *    For example when one pattern may match a prefix of another pattern.
     *
     *    Note that there are situations in which we may wish to order the longer pattern after the shorter one.
     *    For example: [keywords vs Identifiers](https://github.com/SAP/chevrotain/tree/master/examples/lexer/keywords_vs_identifiers).
     * @param config The lexer configuration file
     */
    public constructor(
        lexerDefinition: IHighlightTokenType[] | IHighlightMultiModeLexerDefinition,
        config?: ILexerConfig
    ) {
        super(lexerDefinition, config);

        // Create a lexer without any of the skipped tokens
        let def: IHighlightTokenType[] | IHighlightMultiModeLexerDefinition;
        let map = (tokenTypes: IHighlightTokenType[]) =>
            tokenTypes.map(({GROUP, ...tokenType}) =>
                GROUP == Lexer.SKIPPED || !GROUP ? tokenType : {...tokenType, GROUP}
            );
        if (lexerDefinition instanceof Array) {
            def = map(lexerDefinition);
        } else {
            let modeDef = {
                modes: {} as {[modeName: string]: IHighlightTokenType[]},
                defaultMode: lexerDefinition.defaultMode,
            };
            Object.keys(lexerDefinition.modes).forEach(modeName => {
                const mode = lexerDefinition.modes[modeName];
                modeDef.modes[modeName] = map(mode);
            });
            def = modeDef;
        }
        this.highlightLexer = new Lexer(def, config);
    }

    /**
     * Extracts the full highlight data from the given syntax
     * @param syntax The syntax to highlight
     * @returns The tokens including ones with groups that should be skipped and highlighting tags and possible errors
     */
    public getHighlightData(
        syntax: string
    ): {errors: ILexingError[]; tokens: IHighlightToken[]} {
        // A regular tokenization except it also retrieves the ignored tokens
        const {tokens, errors} = this.highlightLexer.tokenize(syntax);
        return {
            tokens: tokens.map(token => ({
                ...token,
                tags: (token.tokenType as any).tags || [],
            })),
            errors,
        };
    }

    /**
     * Extracts the highlight data from the given syntax
     * @param syntax The syntax to highlight
     * @returns The highlight nodes and possibly a syntax error
     */
    public highlight(
        syntax: string
    ): {nodes: IHighlightNode[]; errors: IHighlightError[]} {
        // Retrieve all the highlight data
        const {tokens, errors: lexingErrors} = this.getHighlightData(syntax);
        let nodes: IHighlightNode[] = tokens.map(
            ({image, startOffset, endOffset, tags}) => ({
                text: image,
                start: startOffset,
                end: endOffset != undefined ? endOffset + 1 : startOffset + image.length,
                tags,
            })
        );
        const errors: IHighlightError[] = lexingErrors.map(
            HighlightLexer.mapError.bind(HighlightLexer, syntax)
        );

        // Insert any nodes that were skipped because they didn't match
        let prevIndex = 0;
        nodes = nodes.flatMap(node => {
            let s = prevIndex;
            prevIndex = node.end;
            if (node.start == s) return node;
            else
                return [
                    {
                        start: s,
                        end: node.start,
                        text: syntax.substring(s, node.start),
                        tags: [],
                    },
                    node,
                ];
        });
        if (prevIndex != syntax.length)
            nodes.push({
                start: prevIndex,
                end: syntax.length,
                text: syntax.substring(prevIndex),
                tags: [],
            });

        // Return the result
        return {nodes, errors};
    }

    /**
     * Maps a lexing error to a highlight error
     * @param syntax The syntax the error corresponds to
     * @param error The error to map
     * @returns The highlight error
     */
    public static mapError(
        syntax: string,
        {message, offset, length}: ILexingError
    ): IHighlightError {
        return {
            message,
            type: "UnexpectedToken",
            syntaxRange: {
                start: offset,
                end: offset + length,
                text: syntax.substr(offset, length),
            },
        };
    }
}
