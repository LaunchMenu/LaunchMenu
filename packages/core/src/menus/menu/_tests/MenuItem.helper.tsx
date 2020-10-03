import React from "react";
import {v4 as uuid} from "uuid";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {getCategoryAction} from "../../actions/types/category/getCategoryAction";
import {executeAction} from "../../actions/types/execute/executeAction";
import {searchAction} from "../../actions/types/search/searchAction";
import {wait} from "../../../_tests/wait.helper";
import {adjustBindings} from "../../items/adjustBindings";
import {ISubscribableActionBindings} from "../../items/_types/ISubscribableActionBindings";

export function createDummyMenuItem({
    category,
    noSelect = false,
    actionBindings,
    name = uuid(),
}: {
    category?: ICategory;
    noSelect?: boolean;
    actionBindings?: ISubscribableActionBindings;
    name?: string;
} = {}): IMenuItem {
    return {
        view: () => <div>hoi</div>,
        actionBindings: adjustBindings(actionBindings ?? [], bindings => [
            ...bindings,
            ...(category ? [getCategoryAction.createBinding(category)] : []),
            ...(noSelect ? [] : [executeAction.createBinding({execute: () => {}})]),
        ]),
        name,
    } as IMenuItem;
}

export function createDummySearchableMenuItem({
    noSelect = false,
    category,
    searchPriorities = {},
    searchDelay = 0,
    name = uuid(),
}: {
    category?: ICategory;
    noSelect?: boolean;
    searchDelay?: number;
    searchPriorities?: {[search: string]: number};
    name?: string;
}): IMenuItem {
    const id = uuid();
    const item: IMenuItem = {
        view: () => <div>hoi</div>,
        actionBindings: [
            ...(category ? [getCategoryAction.createBinding(category)] : []),
            ...(noSelect ? [] : [executeAction.createBinding({execute: () => {}})]),
            searchAction.createBinding([
                {
                    ID: id,
                    search: async ({search}, hook) => {
                        if (searchDelay) await wait(searchDelay);
                        const priority = searchPriorities[search] || 0;
                        if (priority > 0)
                            return {
                                item: {priority, ID: id, item},
                            };
                        return {};
                    },
                },
            ]),
        ],
        name,
    } as IMenuItem;
    return item;
}
