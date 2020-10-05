import {sequentialExecuteHandler} from "./sequentialExecuteHandler";
import {IMenuItem} from "../../../items/_types/IMenuItem";
import {Menu} from "../../../menu/Menu";
import {openUI} from "../../../../context/openUI/openUI";
import {ISubscribable} from "../../../../utils/subscribables/_types/ISubscribable";
import {ProxiedMenu} from "../../../menu/ProxiedMenu";
import {getHooked} from "../../../../utils/subscribables/getHooked";
import {IDataHook} from "model-react";

/**
 * An execution handler to open menus
 */
export const openMenuExecuteHandler = sequentialExecuteHandler.createHandler(
    (
        data: (
            | ISubscribable<IMenuItem[]>
            | {items: ISubscribable<IMenuItem[]>; closeOnExecute: boolean}
        )[]
    ) => ({
        execute: async ({context, preventCallback}) => {
            const callback = preventCallback?.();
            return new Promise(res => {
                const closeOnExecute = data.reduce(
                    (cur, d) => cur || ("closeOnExecute" in d && d.closeOnExecute),
                    false
                );
                const childrenGetter = (h: IDataHook) =>
                    data
                        .map(d =>
                            "items" in d ? getHooked(d.items, h) : getHooked(d, h)
                        )
                        .flat();
                const menu = new ProxiedMenu(context, childrenGetter);
                const close = openUI(
                    context,
                    {
                        menu,
                        onExecute: closeOnExecute
                            ? () => {
                                  close();
                                  callback?.();
                              }
                            : callback,
                    },
                    res
                );
            });
        },
    })
);
