import {IDataSource} from "model-react";
import {ISubscribable} from "../../../utils/subscribables/_types/ISubscribable";
import {ICategorizerConfig} from "./ICategorizerConfig";
import {IPrioritizedMenuItem} from "./IPrioritizedMenuItem";

/**
 * Configuration for a prioritized menu
 */
export type IPrioritizedMenuConfig = Partial<
    Omit<ICategorizerConfig<IPrioritizedMenuItem>, "getItem">
> & {
    /**
     * The maximum number of items in the menu (excluding categories)
     */
    readonly maxItemCount?: ISubscribable<number>;

    /**
     * The interval at which to add the batched items
     */
    readonly batchInterval?: number;

    /**
     * Whether the items are currently loading
     */
    readonly isLoading?: IDataSource<boolean>;
};
