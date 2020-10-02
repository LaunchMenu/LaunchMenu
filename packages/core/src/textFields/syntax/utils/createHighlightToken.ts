import {IHighlightTokenType} from "../_types/IHighlightTokenType";
import {ITokenConfig, createToken} from "chevrotain";

/**
 * Creates a new highlighting tokens
 * @param config The configuration for the token
 * @returns The token type
 */
export function createHighlightToken(
    config: ITokenConfig & {tags: string[]}
): IHighlightTokenType {
    return {...createToken(config), tags: config.tags};
}
