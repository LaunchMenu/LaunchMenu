import {DataCacher} from "../../../utils/modelReact/DataCacher";
import {createAction} from "../../createAction";
import {keyHandlerAction} from "./keyHandlerAction";
import {IForwardKeyHandlerData} from "./_types/IForwardKeyHandlerData";

/**
 * An action handler that forwards key events to other menu items
 */
export const forwardKeyEventHandler = createAction({
    name: "forward key event handler",
    parents: [keyHandlerAction],
    core: (data: IForwardKeyHandlerData[]) => {
        // Create data cachers for each of the targets, such that don't recompute when not needed
        const handlers = data.map(
            ({targets}) => new DataCacher(h => keyHandlerAction.get(targets, h))
        );

        // Create a child for each of the handlers, which just forwards the event and result
        return {
            children: handlers.map(handler =>
                keyHandlerAction.createBinding({
                    onKey: (event, menu, onExecute) => {
                        return handler.get(null).emitRaw(event, menu, onExecute);
                    },
                })
            ),
        };
    },
});
