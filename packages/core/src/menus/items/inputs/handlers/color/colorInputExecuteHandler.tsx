import {IColorInputExecuteData} from "./_types/IColorInputExecuteData";
import Color from "color";
import {ColorInput} from "./ColorInput";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {sequentialExecuteHandler} from "../../../../../actions/types/execute/sequentialExecuteHandler";
import {createAction} from "../../../../../actions/createAction";

//TODO: make a more advanced color input editor in accordance to the planning file
/**
 * A simple execute handler for updating color fields
 */
export const colorInputExecuteHandler = createAction({
    name: "color input handler",
    parents: [sequentialExecuteHandler],
    core: (data: IColorInputExecuteData[]) => ({
        children: data.map(({field, liveUpdate, undoable}) =>
            sequentialExecuteHandler.createBinding(
                ({context}) =>
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
                            {onClose: res}
                        );
                    })
            )
        ),
    }),
});
