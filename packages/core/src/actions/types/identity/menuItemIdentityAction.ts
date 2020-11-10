import {IUUID} from "../../../_types/IUUID";
import {createAction, createStandardBinding} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IBindingCreatorConfig} from "../../_types/IBindingCreator";
import {v4 as uuid} from "uuid";
import {IMenuItemIdentityData} from "./_types/IMenuItemIdentityData";
import {IMenuItem} from "../../../menus/items/_types/IMenuItem";
import {identityAction} from "./identityAction";
import {IDataHook} from "model-react";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {copyItem} from "./copyItem";

/**
 * An action to retrieve the identity of an item (usually the item itself, but allows for overrides)
 */
export const menuItemIdentityAction = createAction({
    name: "Menu item identity",
    parents: [identityAction],
    core: (values: IMenuItemIdentityData[]) => {
        const map = new Map<IUUID, () => IMenuItem>();
        values.forEach(({ID: id, item}) =>
            map.set(id, item instanceof Function ? item : () => item)
        );
        return {
            result: map,
            children: values.map(v => createStandardBinding.call(identityAction, v)),
        };
    },

    // Add a binding creator that automatically generates the ID
    createBinding: function (config) {
        const ID = uuid();
        if (
            typeof config == "object" &&
            ("data" in config || "subscribableData" in config)
        ) {
            return {
                ID,
                action: this,
                ...config,
                ...("subscribableData" in config
                    ? {
                          subscribableData: (h: IDataHook) => ({
                              ID,
                              item: getHooked(config.subscribableData, h),
                          }),
                      }
                    : {
                          data: {
                              ID,
                              item: config.data,
                          },
                      }),
            };
        }
        return {
            ID,
            action: this,
            data: {ID, item: config},
        };
    } as {
        /**
         * Creates a new action binding
         * @param config The data for the binding, and optionally extra configuration
         * @returns The created binding with the identity key
         */
        (
            config:
                | (IMenuItem | (() => IMenuItem))
                | IBindingCreatorConfig<IMenuItem | (() => IMenuItem)>
        ): IActionBinding<IAction<IMenuItemIdentityData, Map<IUUID, () => IMenuItem>>> & {
            ID: IUUID;
        };
    },

    /**
     * Copies an item, making the specified bindings adjustments, updating the identity
     * @param item The item to copy
     * @param bindings The bindings to be added, or a function to obtain the new bindings
     * @returns The newly created item
     */
    copyItem<T extends IMenuItem>(
        item: T,
        bindings?:
            | IActionBinding[]
            | ((oldBindings: IActionBinding[], hook: IDataHook) => IActionBinding[])
    ): T {
        return copyItem(
            item,
            (item, ID) => createStandardBinding.call(menuItemIdentityAction, {ID, item}),
            bindings
        );
    },
});
