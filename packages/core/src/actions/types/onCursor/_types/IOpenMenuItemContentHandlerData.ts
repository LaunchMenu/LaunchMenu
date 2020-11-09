import {IIOContext} from "../../../../context/_types/IIOContext";
import {IMenuItemContent} from "./IMenuItemContent";

/** The data for an opening the content of a menu item */
export type IOpenMenuItemContentHandlerData =
    | IMenuItemContent
    | {
          /** The content to display for the menu item */
          content: IMenuItemContent;
          /** The context to show the content in */
          context: IIOContext;
      };
