import React from "react";
import {SlideLeftCloseTransition} from "../../../components/context/stacks/transitions/close/slideClose/slideCloseDirections";
import {SlideRightOpenTransition} from "../../../components/context/stacks/transitions/open/slideOpen/slideOpenDirectionts";
import {MenuView} from "../../../components/menu/MenuView";
import {IMenu} from "../../../menus/menu/_types/IMenu";
import {UILayer} from "../../standardUILayer/UILayer";

// TODO: move most logic from `setupContextMenuHandler` to this file
export class ContextMenuLayer extends UILayer {
    /**
     * Creates a new context menu layer
     * @param input The menu and callbacks
     */
    public constructor({
        menu,
        onExecute,
        onClose,
    }: {
        menu: IMenu;
        onExecute: () => void;
        onClose: () => void;
    }) {
        super(
            context => ({
                menu,
                icon: "contextMenu",
                onExecute,
                onClose,
                menuView: {
                    view: <MenuView menu={menu} onExecute={onExecute} />,
                    transitions: {
                        Open: SlideRightOpenTransition,
                        Close: SlideLeftCloseTransition,
                    },
                },
            }),
            {path: "Context"}
        );
    }
}
