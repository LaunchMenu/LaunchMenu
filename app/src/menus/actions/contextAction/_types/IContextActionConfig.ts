import {IKeyMatcher} from "../../../../stacks/keyHandlerStack/keyIdentifiers/keys";
import {IActionBinding} from "../../_types/IActionBinding";
import {ReactNode} from "react";

/**
 * The configuration for context menu actions
 */
export type IContextActionConfig = {
    /** The keyboard shortcut for the action */
    shortcut?: IKeyMatcher[]; // TODO: update type once a keyboard matcher setting type exists

    /** The extra action bindings for the item  */
    actionBindings?: IActionBinding<any>[];

    /** The name of the menu item */
    name: string;

    /** The icon of the menu item */
    icon?: string | ReactNode;

    /** The description of the menu item */
    description?: string;

    /** Any tags that can be used for searching */
    tags?: string[];
};
