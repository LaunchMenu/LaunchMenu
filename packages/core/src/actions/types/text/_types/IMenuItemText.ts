import {ISubscribable} from "../../../../utils/subscribables/_types/ISubscribable";

/** The texts that a menu item can specify */
export type IMenuItemText = {
    /** The name of the item */
    name?: ISubscribable<string | undefined>;
    /** The description of the item */
    description?: ISubscribable<string | undefined>;
    /** The content of the item */
    content?: ISubscribable<string | undefined>;
    /** The tags of the item */
    tags?: ISubscribable<string[] | undefined>;
    /** Any additional textual data */
    extra?: ISubscribable<string[] | undefined>;
};
