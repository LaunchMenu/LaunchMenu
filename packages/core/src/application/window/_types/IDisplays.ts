import {IPosition} from "./IPosition";
import {ISize} from "./ISize";

export type IDisplay = IPosition & ISize;
export type IDisplays = {
    all: IDisplay[];
    primary: IDisplay;
};
