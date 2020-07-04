import React from "react";

import {ICategory} from "../../category/_types/ICategory";
import {getCategoryHandler} from "../../category/getCategoryHandler";
import {IMenuItem} from "../../items/_types/IMenuItem";

export function createMenuItem(category?: ICategory): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: category ? [getCategoryHandler.createBinding(category)] : [],
    };
}
