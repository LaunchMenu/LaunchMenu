import {useDataHook} from "model-react";
import React from "react";
import {FillBox} from "../../components/FillBox";
import {MenuView} from "../../components/menu/MenuView";
import {IMenuViewProps} from "../../components/menu/_types/IMenuViewProps";
import {useIOContext} from "../../context/react/useIOContext";
import {LFC} from "../../_types/LFC";
import {baseSettings} from "../settings/baseSettings/baseSettings";
import {HomeContentVisibility} from "../settings/baseSettings/general/content/_types/HomeContentVisibility";

/**
 * A view for the main menu, that shows an `about lm` screen if empty
 */
export const MainMenuView: LFC<IMenuViewProps> = ({menu, ...props}) => {
    const [h] = useDataHook();
    const search = menu.getHighlight?.(h) || {search: ""};
    const context = useIOContext();
    const contentSettings = context?.settings.get(baseSettings).content.homeContent;

    return (
        <>
            <MenuView {...props} menu={menu} />
            {!search.search &&
                contentSettings?.visibility.get(h) ==
                    HomeContentVisibility.inEmptyMenu && (
                    <FillBox backgroundColor="bgTertiary">
                        {contentSettings?.content.get(h).content}
                    </FillBox>
                )}
        </>
    );
};
