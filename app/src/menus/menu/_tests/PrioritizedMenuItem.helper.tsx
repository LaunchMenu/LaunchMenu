import React from "react";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {createMenuItem} from "./MenuItem.helper";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {v4 as uuid} from "uuid";
import {IActionBinding} from "../../actions/_types/IActionBinding";
import {ISubscribableActionBindings} from "../../items/_types/ISubscribableActionBindings";

export function createPrioritizedMenuItem<
    V,
    T extends {
        priority?: number;
        category?: ICategory | undefined;
        generateID?: boolean;
        noSelect?: boolean;
        actionBindings?: ISubscribableActionBindings;
        getUpdatedPriority?: (data: V) => Promise<number>;
    }
>({
    priority = 1,
    category = undefined as undefined | ICategory,
    generateID = false,
    noSelect = false,
    actionBindings,
    getUpdatedPriority,
}: T): IPrioritizedMenuItem<V> {
    return {
        priority,
        item: createMenuItem({category, noSelect, actionBindings}),
        id: generateID ? uuid() : undefined,
        getUpdatedPriority,
    } as any;
}
