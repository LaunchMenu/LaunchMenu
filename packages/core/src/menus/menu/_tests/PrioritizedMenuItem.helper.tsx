import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {createDummyMenuItem} from "./MenuItem.helper";
import {v4 as uuid} from "uuid";
import {IPriority} from "../priority/_types/IPriority";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {IActionBinding} from "../../../actions/_types/IActionBinding";
import {ICategory} from "../../../actions/types/category/_types/ICategory";

export function createDummyPrioritizedMenuItem<
    T extends {
        priority?: IPriority;
        category?: ICategory | undefined;
        generateID?: boolean;
        noSelect?: boolean;
        actionBindings?: ISubscribable<IActionBinding[]>;
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
