import {IIOContext} from "../../../context/_types/IIOContext";

/**
 * The default query data which can be augmented
 */
export type IQuery = {
    search: string;
    /** The context that can be used for E.G. settings */
    context: IIOContext;
};
