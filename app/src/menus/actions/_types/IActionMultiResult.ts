import {IMenuItem} from "../../items/_types/IMenuItem";
import {results, sources} from "../Action";

/**
 * A format to make action handlers return multiple responses
 */
export type IActionMultiResult<O> = {
    /** The results of the handler */
    [results]: O[];
    /**
     * Optional sources that the data originates from.
     * This data can be left out if there is only 1 result, or as many results as there were inputs, in other cases it should be provided.
     */
    [sources]?: IMenuItem[][];
};
