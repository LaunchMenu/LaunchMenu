import {ILexerConfig, IParserConfig} from "chevrotain";

export type IHighlightParserConfig = ILexerConfig & IParserConfig & {startRule?: string};
