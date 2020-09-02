import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";

export type ISelectOptionData<T> = {
    value: T;
    view: IMenuItem;
};
