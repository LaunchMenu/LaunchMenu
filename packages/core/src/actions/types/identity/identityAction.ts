import {IUUID} from "../../../_types/IUUID";
import {createAction, createStandardBinding} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionTarget} from "../../_types/IActionTarget";
import {IBindingCreatorConfig} from "../../_types/IBindingCreator";
import {IIdentityData} from "./_types/IIdentityData";
import {v4 as uuid} from "uuid";
import {getHooked} from "../../../utils/subscribables/getHooked";
import {IDataHook} from "model-react";
import {copyItem} from "./copyItem";
import {IPrioritizedMenuItem} from "../../../menus/menu/_types/IPrioritizedMenuItem";

/**
 * An action to retrieve the identity of an item (usually the item itself, but allows for overrides)
 */
export const identityAction = createAction({
    name: "Identity",
    core: (values: IIdentityData[]) => {
        const map = new Map<IUUID, () => IActionTarget>();
        values.forEach(({ID: id, item}) =>
            map.set(id, item instanceof Function ? item : () => item)
        );
        return {result: map};
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
         * Creates a new action binding and generates an ID for this item identity
         * @param config The data for the binding, and optionally extra configuration
         * @returns The created binding with the identity key
         */
        (
            config:
                | IActionTarget
                | (() => IActionTarget)
                | IBindingCreatorConfig<IActionTarget | (() => IActionTarget)>
        ): IActionBinding<IAction<IIdentityData, Map<IUUID, () => IActionTarget>>> & {
            ID: IUUID;
        };
    },
    extras: {
        /**
         * Copies an item, making the specified bindings adjustments, updating the identity
         * @param item The item to copy
         * @param bindings The bindings to be added, or a function to obtain the new bindings
         * @returns The newly created item
         */
        copyItem<T extends IActionTarget>(
            item: T,
            bindings?:
                | IActionBinding[]
                | ((oldBindings: IActionBinding[], hook: IDataHook) => IActionBinding[])
        ): T {
            return copyItem(
                item,
                (item, ID) => createStandardBinding.call(identityAction, {ID, item}),
                bindings
            );
        },

        /**
         * Copies an item, making the specified bindings adjustments, updating the identity
         * @param item The prioritized item to copy
         * @param bindings The bindings to be added, or a function to obtain the new bindings
         * @returns The newly created prioritized item
         */
        copyPrioritizedItem(
            item: IPrioritizedMenuItem,
            bindings?:
                | IActionBinding[]
                | ((oldBindings: IActionBinding[], hook: IDataHook) => IActionBinding[])
        ): IPrioritizedMenuItem {
            return {
                ...item,
                item: identityAction.copyItem(item.item, bindings),
            };
        },

        /**
         * Retrieves the identity of an target
         * @param item The item to get the identity for
         * @returns The found identity
         */
        getIdentity(item: IActionTarget): IUUID | undefined {
            return [...identityAction.get([item]).keys()][0];
        },
    },
});
