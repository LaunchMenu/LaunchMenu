import React from "react";
import {IMenuItem} from "../../_types/IMenuItem";
import {ICategory} from "../../category/_types/ICategory";
import {getCategoryHandler} from "../../category/getCategoryHandler";

export function createMenuItem(category?: ICategory): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: category ? [getCategoryHandler.createBinding(category)] : [],
    };
}
