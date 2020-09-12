import {IHighlightTokenType} from "../_types/IHighlightTokenType";
import {ITokenConfig} from "chevrotain";
import {createHighlightToken} from "./createHighlightToken";

/**
 * Creates multiple highlight tokens at once.
 * The order of these of these tokens matter, see {@link https://sap.github.io/chevrotain/docs/tutorial/step1_lexing.html#creating-the-lexer}.
 * @param config The config containing the token specification
 * @returns An object with the tokens in map and list form
 */
export function createHighlightTokens<
    T extends {
        [name: string]: Omit<ITokenConfig, "name"> & {name?: string; tags: string[]};
    }
>(
    config: T
): {tokens: {[P in keyof T]: IHighlightTokenType}; tokenList: IHighlightTokenType[]} {
    const tokens = {} as any;
    const tokenList = Object.keys(config).map(key => {
        const def = config[key];
        const namedDef = createHighlightToken({...def, name: key});
        tokens[key] = namedDef;
        return namedDef;
    });
    return {tokens, tokenList};
}
