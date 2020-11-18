/**
 * The basic ui layer config
 */
export type IUILayerBaseConfig = {
    /** The relative input path, defaults to "." */
    path?: string;
    /** Whether to show a semi transparent overlay for sections without content, defaults to true */
    showNodataOverlay?: boolean;
    /** Whether to catch all key events and prevent lower layers from catching them, defaults to true */
    catchAllKeys?: boolean;
};
