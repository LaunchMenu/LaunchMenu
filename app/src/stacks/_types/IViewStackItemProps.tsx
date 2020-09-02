import {IViewStack} from "./IViewStack";

export type IViewStackItemProps = {
    onTop: boolean;
    index: number;
    stack: IViewStack;
};
