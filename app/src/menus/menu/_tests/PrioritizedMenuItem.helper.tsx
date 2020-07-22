import React from "react";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {createMenuItem} from "./MenuItem.helper";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {v4 as uuid} from "uuid";

export function createPrioritizedMenuItem<
    V,
    T extends {
        priority?: number;
        category?: ICategory | undefined;
        generateID?: boolean;
        noSelect?: boolean;
        getUpdatedPriority?: (data: V) => Promise<number>;
    }
>({
    priority = 1,
    category = undefined as undefined | ICategory,
    generateID = false,
    noSelect = false,
    getUpdatedPriority,
}: T): IPrioritizedMenuItem<V> {
    return {
        priority,
        item: createMenuItem(category, noSelect),
        id: generateID ? uuid() : undefined,
        getUpdatedPriority,
    } as any;
}
