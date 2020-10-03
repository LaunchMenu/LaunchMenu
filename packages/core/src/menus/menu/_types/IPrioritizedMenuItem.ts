import {IMenuItem} from "../../items/_types/IMenuItem";
import { IPriority } from "../priority/_types/IPriority";

export type IPrioritizedMenuItem = {
    priority: IPriority;
    item: IMenuItem;
    ID?: string | number;
};
