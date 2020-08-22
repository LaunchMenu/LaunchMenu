import {IViewStackItemProps} from "../_types/IViewStackItemProps";
import {useMemo} from "react";
import {getViewStackItemElement} from "../../components/stacks/getViewStackItemElement";

/**
 * Retrieves the element below this element on the stack if any
 * @param data The stack information to get the element with
 * @returns The element on the stack
 */
export function usePreviousStackItem(
    data: Partial<IViewStackItemProps>
): JSX.Element | undefined {
    if (data.stack && data.index != undefined) {
        const prevIndex = data.index - 1;
        const stack = data.stack;
        const item = data.stack.get()[prevIndex];
        const element = useMemo(() => {
            if (!item) return undefined;
            let {value, id} = item;
            const props = {onTop: false, stack, index: prevIndex, key: id};
            if ("view" in value) value = value.view;

            return value && getViewStackItemElement(value, props);
        }, [item]);
        return element;
    }
}
