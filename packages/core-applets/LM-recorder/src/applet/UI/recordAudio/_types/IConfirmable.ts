import {IActionBinding, IExecutable} from "@launchmenu/core";

/** A confirmable function */
export type IConfirmable = {
    /** The confirmation message to show */
    message?: string;
    /** The action name to show */
    actionMessage?: string;
    /** The execute binding to perform on confirmation */
    onConfirm: IActionBinding | IExecutable;
    /** The execute binding to perform on cancel */
    onCancel?: IActionBinding | IExecutable;
};
