import {sequentialExecuteHandler} from "./sequentialExecuteHandler";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {Menu} from "../../../menu/Menu";
import {openUI} from "../../../../context/openUI/openUI";

/**
 * An execution handler to open menus
 */
export const openMenuExecuteHandler = sequentialExecuteHandler.createHandler(
    (data: IMenuItem[][]) => ({
        execute: async ({context}) =>
            new Promise(res => {
                const children = data.flat();
                const menu = new Menu(context, children);
                openUI(context, {menu}, res);
            }),
    })
);
