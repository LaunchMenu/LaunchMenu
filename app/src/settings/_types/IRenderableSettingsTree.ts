import {IMenuItem} from "../../menus/items/_types/IMenuItem";
import {IField} from "../../_types/IField";

/**
 * A settings tree that can easily be rendered in a menu
 */
export type IRenderableSettingsTree = {
    [key: string]: IMenuItem & (IField<any> | {children: IRenderableSettingsTree});
};
