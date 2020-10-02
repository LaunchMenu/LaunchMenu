import {IIOContext} from "../../../../context/_types/IIOContext";
import {IPrioritizedMenuItem} from "../../../menu/_types/IPrioritizedMenuItem";

/**
 * Retrieves the item to show in the context menu
 */
export type IContextMenuItemGetter = (
    context: IIOContext,
    close?: () => void
) => IPrioritizedMenuItem | IPrioritizedMenuItem[];
