import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {createDummyMenuItem} from "./MenuItem.helper";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {v4 as uuid} from "uuid";
import {ISubscribableActionBindings} from "../../items/_types/ISubscribableActionBindings";

export function createPrioritizedMenuItem<
    T extends {
        priority?: number;
        category?: ICategory | undefined;
        generateID?: boolean;
        noSelect?: boolean;
        actionBindings?: ISubscribableActionBindings;
    }
>({
    priority = 1,
    category = undefined as undefined | ICategory,
    generateID = false,
    noSelect = false,
    actionBindings,
}: T): IPrioritizedMenuItem & (T extends {generateID: true} ? {id: string} : unknown) {
    return {
        priority,
        item: createDummyMenuItem({category, noSelect, actionBindings}),
        id: generateID ? uuid() : undefined,
    } as any;
}
