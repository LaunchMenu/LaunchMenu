import {useDataHook, proxyHook} from "model-react";
import {useMemo, useRef} from "react";
import {isItemSelectable} from "../../menus/items/isItemSelectable";
import {IMenuItem} from "../../menus/items/_types/IMenuItem";

/**
 * A react hook that checks whether a given item is selectable
 * @param item The menu item to check
 * @returns Whether the item is selectable
 */
export function useIsItemSelectable(item?: IMenuItem): boolean {
    const [h] = useDataHook();
    let version = useRef(1);
    return useMemo(
        () =>
            item
                ? isItemSelectable(
                      item,
                      proxyHook(h, {
                          onCall: () => {
                              version.current++;
                          },
                      })
                  )
                : false,
        [version.current]
    );
}
