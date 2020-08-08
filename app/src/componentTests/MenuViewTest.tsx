import React, {FC} from "react";
import {Menu} from "../menus/menu/Menu";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createStandardMenuItem} from "../menus/items/createStandardMenuItem";
import {ViewStack} from "../stacks/ViewStack";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {StackView} from "../components/stacks/StackView";
import {Action} from "../menus/actions/Action";
import {IOContext} from "../context/IOContext";
import {Box} from "../styling/box/Box";
import {keyHandlerAction} from "../menus/actions/types/keyHandler/keyHandlerAction";
import {createContextAction} from "../menus/actions/contextAction/createContextAction";

// Create some context action
const alertAction = new Action(
    createContextAction(
        (data: {message: string}[]) => {
            const text = data.map(({message}) => message).join(",");
            return {execute: () => alert(text)};
        },
        {name: "Alert all"}
    )
);
const alertHandlerAction = alertAction.createHandler(
    createContextAction(
        (data: {message: string}[]) => {
            const text = "(" + data.map(({message}) => message).join(",") + ")";
            return {
                message: text,
                execute: () => alert(text),
            };
        },
        {name: "Sub Alert", shortcut: ["ctrl", "q"]}
    )
);

// Create stacks and some menu
const menuViewStack = new ViewStack();
const fieldViewStack = new ViewStack();
const inputStack = new KeyHandlerStack(new KeyHandler(window));
const menu = new Menu([
    createStandardMenuItem({
        name: "bob (alert)",
        onExecute: () => console.log("bob"),
        actionBindings: [alertAction.createBinding({message: "Bob"})],
    }),
    createStandardMenuItem({
        name: "Hank (alert)",
        onExecute: () => console.log("Hank"),
        actionBindings: [alertAction.createBinding({message: "Hank"})],
    }),
    createStandardMenuItem({
        name: "Woof (alert)",
        onExecute: () => console.log("Woof"),
        actionBindings: [
            alertAction.createBinding({message: "Woof"}),
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (e.is(["ctrl", "p"])) {
                        console.log("p pressed mofo1");
                        return {
                            stopPropagation: true,
                        };
                    }
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Oranges (sub alert)",
        onExecute: () => console.log("Oranges"),
        actionBindings: [
            alertHandlerAction.createBinding({message: "Oranges"}),
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (e.is(["ctrl", "p"])) {
                        console.log("p pressed mofo2");
                        return true;
                    }
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Poof (sub alert)",
        onExecute: () => console.log("Poof"),
        actionBindings: [alertHandlerAction.createBinding({message: "Poof"})],
    }),
    createStandardMenuItem({name: "Wow", onExecute: () => console.log("Wow")}),
]);
const context = new IOContext({
    panes: {menu: menuViewStack, content: menuViewStack, field: fieldViewStack},
    keyHandler: inputStack,
});
context.openUI({
    menu,
    // menuHandler: createMenuKeyHandler(menu, context),
});

(window as any).alertAction = alertAction;
(window as any).alertHandlerAction = alertHandlerAction;
(window as any).createStandardMenuItem = createStandardMenuItem;

export const MenuViewTest: FC = () => {
    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box position="relative" height={80}>
                <StackView items={fieldViewStack} />
            </Box>
            <Box position="relative" flexGrow={1}>
                <StackView items={menuViewStack} />
            </Box>
        </Box>
    );
};
