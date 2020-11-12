import {ICategory} from "../../../actions/types/category/_types/ICategory";
import {IMenuItem} from "../../items/_types/IMenuItem";

export type IMenuCategoryData = {
    category: ICategory | undefined;
    items: IMenuItem[];
};
