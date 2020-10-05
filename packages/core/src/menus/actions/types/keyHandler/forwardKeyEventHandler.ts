import {IMenuItem} from "../../../items/_types/IMenuItem";
import {results, sources} from "../../Action";
import {extractActionBindingData} from "../../utils/extractActionBindingData";
import {keyHandlerAction} from "./keyHandlerAction";
import {IForwardKeyHandlerData} from "./_types/IForwardKeyHandlerData";
import {IItemKeyHandler} from "./_types/IItemKeyHandler";

/**
 * Creates a keyHandlerAction handler which forwards events to other menu items
 */
export const forwardKeyEventHandler = keyHandlerAction.createHandler(
    (data: IForwardKeyHandlerData[], items, hook) => {
        let listeners = [] as IItemKeyHandler[];
        let listenerSources = [] as IMenuItem[][];
        data.forEach(({targets}, i) => {
            const source = items[i];
            extractActionBindingData(keyHandlerAction, targets, hook).forEach(
                ({data}) => {
                    listeners.push(data);
                    listenerSources.push(source);
                }
            );
        });
        return {
            [results]: listeners,
            [sources]: listenerSources,
        };
    }
);
