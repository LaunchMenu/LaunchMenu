import {
    ColorInput,
    createAction,
    editExecuteHandler,
    IColorInputExecuteData,
    ICommand,
} from "@launchmenu/core";
import Color from "color";
import {inherit} from "../../dataModel/_types/IInherit";

//TODO: update color input when available in LM
/**
 * A simple execute handler for updating color fields
 */
export const inheritableColorInputExecuteHandler = createAction({
    name: "Inheritable color input handler",
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
                                    if (text == inherit) return;
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
