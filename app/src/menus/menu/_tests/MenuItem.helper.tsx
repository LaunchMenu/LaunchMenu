import React from "react";

import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {executeAction} from "../../actions/types/execute/executeAction";
import {searchAction} from "../../actions/types/search/searchAction";
import {wait} from "../../../_tests/wait.helper";

export function createMenuItem(
    category?: ICategory,
    noSelect: boolean = false
): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: [
            ...(category ? [getCategoryAction.createBinding(category)] : []),
            ...(noSelect ? [] : [executeAction.createBinding(() => {})]),
        ],
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
    const id = Math.floor(Math.random() * 1e6) + "";
    const item = {
        view: () => <div>hoi</div>,
        actionBindings: [
            ...(category ? [getCategoryAction.createBinding(category)] : []),
            ...(noSelect ? [] : [executeAction.createBinding(() => {})]),
            ...[
                searchAction.createBinding({
                    search: async ({search}, cb) => {
                        if (searchDelay) await wait(searchDelay);
                        await cb({
                            item,
                            priority: searchPriorities[search] || 0,
                            id,
                            getUpdatedPriority: async ({search}) =>
                                searchPriorities[search] || 0,
                        });
                    },
                }),
            ],
        ],
    };
    return item;
}
