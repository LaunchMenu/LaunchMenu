import {IBaseTheme} from "./IBaseTheme";
import {IHighlightTheme} from "../highlighting/_types/IHighlightTheme";

/**
 * A theme used to consistently style the application as well as allowing users to customize it
 */
export type ITheme = IBaseTheme & {highlighting: IHighlightTheme};
