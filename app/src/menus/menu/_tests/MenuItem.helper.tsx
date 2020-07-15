import React from "react";

import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";

export function createMenuItem(category?: ICategory): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: category ? [getCategoryAction.createBinding(category)] : [],
    };
}
