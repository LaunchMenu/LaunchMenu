/**
 * Extra action binding data that's inherent to the given item type and won't be change often
 */
export type IStandardActionBindingExtraData = {
    /** The connection group that should be used to visually connect to the previous and ore next items in the menu if they have the same group */
    connectionGroup?: {top?: Symbol; bottom?: Symbol} | undefined;
    /** Whether to generate a simple search binding, defaults to true */
    includeSearch?: boolean;
};
