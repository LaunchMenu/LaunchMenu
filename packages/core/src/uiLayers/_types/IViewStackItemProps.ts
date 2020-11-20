import {IIdentifiedItem} from "../../_types/IIdentifiedItem";
import {IViewStackItem} from "./IViewStackItem";

export type IViewStackItemProps = Partial<{
    onTop: boolean;
    index: number;
    stack: IIdentifiedItem<IViewStackItem>[];
}>;
