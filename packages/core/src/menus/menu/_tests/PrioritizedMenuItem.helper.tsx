import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {createDummyMenuItem} from "./MenuItem.helper";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {v4 as uuid} from "uuid";
import {ISubscribableActionBindings} from "../../items/_types/ISubscribableActionBindings";
import {IPriority} from "../priority/_types/IPriority";

export function createDummyPrioritizedMenuItem<
    T extends {
        priority?: IPriority;
        category?: ICategory | undefined;
        generateID?: boolean;
        noSelect?: boolean;
        actionBindings?: ISubscribableActionBindings;
        name?: string;
    }
>({
    priority = 1,
    category = undefined as undefined | ICategory,
    generateID = false,
    noSelect = false,
    actionBindings,
    name,
}: T): IPrioritizedMenuItem & (T extends {generateID: true} ? {id: string} : unknown) {
    return ({
        priority,
        item: createDummyMenuItem({category, noSelect, actionBindings, name}),
        ID: generateID ? uuid() : undefined,
    } as any) as IPrioritizedMenuItem &
        (T extends {generateID: true} ? {id: string} : unknown);
}
