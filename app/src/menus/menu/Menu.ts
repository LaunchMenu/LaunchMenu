import {IMenuItem} from "../_types/IMenuItem";
import {IPrioritizedMenuItem} from "../_types/IPrioritizedMenuItem";
import {IDataHook} from "model-react";
import {SortedList} from "../../utils/SortedList";

class Menu {
    protected maxItemCount: number;
    protected items = new SortedList<IPrioritizedMenuItem>(
        ({priority: a}, {priority: b}) => a > b
    );

    public constructor(maxItemCount?: number) {}

    public addItem(item: IPrioritizedMenuItem): void;
    public addItem(item: IMenuItem, index: number = Infinity): void;
    public removeItem(item: IPrioritizedMenuItem): void;
    public removeItem(item: IMenuItem): void;

    public setSelected(item: IMenuItem, selected: boolean = true): void;
    public setCursor(item: IMenuItem): void;

    public getItems(h: IDataHook): IMenuItem[];
    public getSelectedItems(h: IDataHook): IMenuItem[];
    public getCursor(h: IDataHook): IMenuItem;

    public view: IStackItem;
}
