import {useMemo} from "react";
import {getViewStackItemElement} from "../../components/stacks/getViewStackItemElement";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {IViewStackItemProps} from "../../uiLayers/_types/IViewStackItemProps";
import {IUUID} from "../../_types/IUUID";

/**
 * Retrieves the previous item on the stack
 * @param data The data that's passed as props to stack items
 * @returns The stack item UI below this one if any
 */
export function usePreviousStackItem(
    data: Partial<IViewStackItemProps>
): JSX.Element | undefined {
    if (data.stack && data.index != undefined) {
        const prevIndex = data.index - 1;
        const stack = data.stack;
        const item = data.stack[prevIndex];
        const element = useMemo(() => {
            if (!item) return undefined;
            let {value, ID}: {value: IViewStackItem | undefined; ID: IUUID} = item;
            const props = {onTop: false, stack, index: prevIndex, key: ID};
            if ("view" in value) value = value.view;
            if ("close" in value) value = undefined;

            return value && getViewStackItemElement(value, props);
        }, [item]);
        return element;
    }
}
