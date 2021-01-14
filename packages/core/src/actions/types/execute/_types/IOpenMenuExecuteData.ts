import {ReactElement} from "react";
import {IMenuItem} from "../../../../menus/items/_types/IMenuItem";
import {IThemeIcon} from "../../../../styling/theming/_types/IBaseTheme";
import {ISubscribable} from "../../../../utils/subscribables/_types/ISubscribable";

/**
 * The data that can be opened as a menu using the openMenuExecuteHandler action
 */
export type IOpenMenuExecuteData =
    | ISubscribable<IMenuItem[]>
    | {
          /** The items to be shown in the menu */
          items: ISubscribable<IMenuItem[]>;
          /** Whether to close the menu when an item is executed */
          closeOnExecute?: boolean;
          /** The name to show in the path for this menu */
          pathName?: string;
          /** The icon to be shown in the search field of this menu */
          searchIcon?: IThemeIcon | ReactElement;
      };
