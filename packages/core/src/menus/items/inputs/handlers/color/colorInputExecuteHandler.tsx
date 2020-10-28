import {IColorInputExecuteData} from "./_types/IColorInputExecuteData";
import Color from "color";
import {results} from "../../../../actions/Action";
import {ColorInput} from "./ColorInput";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {IExecutable} from "../../../../actions/types/execute/_types/IExecutable";
import {sequentialExecuteHandler} from "../../../../actions/types/execute/sequentialExecuteHandler";

//TODO: make a more advanced color input editor in accordance to the planning file
/**
 * A simple execute handler for updating color fields
 */
export const colorInputExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IColorInputExecuteData[]) => ({
        [results]: data.map(
            ({field, liveUpdate, undoable}): IExecutable => ({
                execute: ({context}) =>
                    new Promise<ICommand | void>(res => {
                        context.open(
                            new ColorInput(field, {
                                undoable,
                                liveUpdate: liveUpdate as any,
                                checkValidity: text => {
                                    try {
                                        new Color(text);
                                    } catch {
                                        return {
                                            message: `'${text}' is not a valid color`,
                                            ranges: [{start: 0, end: text.length}],
                                        };
                                    }
                                },
                            }),
                            res
                        );
                    }),
            })
        ),
    })
);
