import {IColorInputExecuteData} from "./_types/IColorInputExecuteData";
import Color from "color";
import {ColorInput} from "./ColorInput";
import {ICommand} from "../../../../../undoRedo/_types/ICommand";
import {createAction} from "../../../../../actions/createAction";
import {editExecuteHandler} from "../../../../../actions/types/execute/types/editExecuteHandler";

//TODO: make a more advanced color input editor in accordance to the planning file
/**
 * A simple execute handler for updating color fields
 */
export const promptColorInputExecuteHandler = createAction({
    name: "color input handler",
    parents: [editExecuteHandler],
    core: (data: IColorInputExecuteData[]) => ({
        children: data.map(({field, liveUpdate, undoable}) =>
            editExecuteHandler.createBinding(
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
