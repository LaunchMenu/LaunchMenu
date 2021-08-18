import {IErrorComp} from "./IErrorComp";

export type IGetErrorComp = {
    /**
     * Returns the error component to render
     * @param Comp The original component that would be rendered
     * @returns The error component to be rendered
     */
    (Comp: IErrorComp): IErrorComp;
};
