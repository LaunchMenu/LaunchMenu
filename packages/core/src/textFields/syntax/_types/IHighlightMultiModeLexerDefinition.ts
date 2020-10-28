import {IHighlightTokenType} from "./IHighlightTokenType";
export type IHighlightMultiModesDefinition = {
    [modeName: string]: IHighlightTokenType[];
};

export type IHighlightMultiModeLexerDefinition = {
    modes: IHighlightMultiModesDefinition;
    defaultMode: string;
};
