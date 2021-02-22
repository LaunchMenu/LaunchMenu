import {IDataHook} from "model-react";
import {adjustBindings} from "../../../menus/items/adjustBindings";
import {IUUID} from "../../../_types/IUUID";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionTarget} from "../../_types/IActionTarget";
import {identityAction} from "./identityAction";
import {v4 as uuid} from "uuid";

/**
 * Copies an item, making the specified bindings adjustments, updating the identity
 * @param item The item to copy
 * @param createIdentityBinding The function to create a new identity binding
 * @param bindings The bindings to be added, or a function to obtain the new bindings
 * @returns The newly created item
 */
export function copyItem<T extends IActionTarget>(
    item: T,
    createIdentityBinding?: (item: () => T, ID: IUUID) => IActionBinding,
    bindings?:
        | IActionBinding[]
        | ((oldBindings: IActionBinding[], hook: IDataHook) => IActionBinding[])
): T {
    const IDMap = identityAction.get([item]);

    // Find the ID corresponding to the specified target
    const ID = [...IDMap].find(([ID, target]) => (target as any) == item)?.[0] ?? uuid();

    let newItem: T;
    if (item.actionBindings instanceof Function || bindings instanceof Function)
        newItem = {
            ...item,
            actionBindings: adjustBindings(item.actionBindings, (oldBindings, h) => {
                const newIdentity = createIdentityBinding?.(() => newItem, ID);
                return [
                    ...(bindings instanceof Function
                        ? bindings(oldBindings, h)
                        : bindings
                        ? [...oldBindings, ...bindings]
                        : oldBindings),
                    ...(newIdentity ? [newIdentity] : []),
                ];
            }),
        };
    else {
        const newIdentity = createIdentityBinding?.(() => newItem, ID);
        newItem = {
            ...item,
            actionBindings: [
                ...item.actionBindings,
                ...(bindings ? bindings : []),
                ...(newIdentity ? [newIdentity] : []),
            ],
        };
    }
    return newItem;
}
