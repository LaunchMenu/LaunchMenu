import React from "react";
import {v4 as uuid} from "uuid";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {executeAction} from "../../actions/types/execute/executeAction";
import {searchAction} from "../../actions/types/search/searchAction";
import {wait} from "../../../_tests/wait.helper";
import {adaptBindings} from "../../items/adjustBindings";
import {ISubscribableActionBindings} from "../../items/_types/ISubscribableActionBindings";

export function createMenuItem({
    category,
    noSelect = false,
    actionBindings,
}: {
    category?: ICategory;
    noSelect?: boolean;
    actionBindings?: ISubscribableActionBindings;
} = {}): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: adaptBindings(actionBindings ?? [], bindings => [
            ...bindings,
            ...(category ? [getCategoryAction.createBinding(category)] : []),
            ...(noSelect ? [] : [executeAction.createBinding({execute: () => {}})]),
        ]),
    };
}

export function createSearchableMenuItem({
    noSelect = false,
    category,
    searchPriorities = {},
    searchDelay = 0,
}: {
    category?: ICategory;
    noSelect?: boolean;
    searchDelay?: number;
    searchPriorities?: {[search: string]: number};
}): IMenuItem {
    const id = uuid();
    const item: IMenuItem = {
        view: () => <div>hoi</div>,
        actionBindings: [
            ...(category ? [getCategoryAction.createBinding(category)] : []),
            ...(noSelect ? [] : [executeAction.createBinding({execute: () => {}})]),
            searchAction.createBinding([
                {
                    id,
                    search: async ({search}, hook) => {
                        if (searchDelay) await wait(searchDelay);
                        const priority = searchPriorities[search] || 0;
                        if (priority > 0)
                            return {
                                item: {priority, id, item},
                            };
                        return {};
                    },
                },
            ]),
        ],
    };
    return item;
}
