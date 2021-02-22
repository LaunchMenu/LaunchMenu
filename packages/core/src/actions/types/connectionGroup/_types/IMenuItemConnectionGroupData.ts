export type IMenuItemConnectionGroupData = {
    /** The connection group to connect with at the top */
    top?: Symbol;
    /** The connection group to connect with at the bottom */
    bottom?: Symbol;
    /** Whether to skip this item when it comes to connections, in case the item is hidden */
    skip?: boolean;
};

export type IGetConnectionGroupResult = {
    /** The connection group to connect with at the top */
    top: Set<Symbol>;
    /** The connection group to connect with at the bottom */
    bottom: Set<Symbol>;
    /** Whether to skip this item when it comes to connections, in case the item is hidden */
    skip: boolean;
};
