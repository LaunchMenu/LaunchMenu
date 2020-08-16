import {IMenuItem} from "../../../items/_types/IMenuItem";
import {IIOContext} from "../../../../context/_types/IIOContext";

/**
 * Retrieves the item to show in the context menu
 */
export type IContextMenuItemGetter = (
    context: IIOContext,
    close?: () => void
) => IMenuItem;
