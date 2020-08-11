import {IBaseCommand} from "./IBaseCommand";
import {ICompoundCommand} from "./ICompoundCommand";

/**
 * A commando that can be executed and undone
 */
export type ICommand = ICompoundCommand | IBaseCommand;
