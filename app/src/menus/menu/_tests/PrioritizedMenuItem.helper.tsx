import React from "react";
import {IPrioritizedMenuItem} from "../../_types/IPrioritizedMenuItem";
import {createMenuItem} from "./MenuItem.helper";

export function createPrioritizedMenuItem(priority = 0): IPrioritizedMenuItem {
    return {
        priority,
        item: createMenuItem(),
    };
}
