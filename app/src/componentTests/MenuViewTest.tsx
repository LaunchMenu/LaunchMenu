import React, {FC, useState, useCallback} from "react";
import {Menu} from "../menus/menu/Menu";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createStandardMenuItem} from "../menus/items/createStandardMenuItem";
import {ViewStack} from "../stacks/ViewStack";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {StackView} from "../components/stacks/StackView";
import {Action} from "../menus/actions/Action";
import {createMenuKeyHandler} from "../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {IOContext} from "../context/IOContext";
import {TextField} from "@fluentui/react";
import {Box} from "../styling/box/Box";
import {SearchMenu} from "../menus/menu/SearchMenu";

// Create some context action
const alertAction = new Action(
    (data: {message: string}[]) => {
        const text = data.map(({message}) => message).join(",");
        const execute = () => alert(text);
        return {
            execute,
            getMenuItem: (closeMenu: () => void) =>
                createStandardMenuItem({
                    name: "Alert All",
                    onExecute: () => {
                        execute();
                        closeMenu();
                    },
                }),
        };
    },
    ["context"]
);
const alertHandlerAction = alertAction.createHandler((data: {message: string}[]) => {
    const text = "(" + data.map(({message}) => message).join(",") + ")";
    const execute = () => alert(text);
    return {
        message: text,
        execute,
        getMenuItem: (closeMenu: () => void) =>
            createStandardMenuItem({
                name: "Sub Alert",
                onExecute: () => {
                    execute();
                    closeMenu();
                },
                actionBindings: [
                    alertHandlerAction.createBinding({message: "Meta alert! " + text}),
                ],
            }),
    };
});

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
        actionBindings: [alertAction.createBinding({message: "Woof"})],
    }),
    createStandardMenuItem({
        name: "Oranges (sub alert)",
        onExecute: () => console.log("Oranges"),
        actionBindings: [alertHandlerAction.createBinding({message: "Oranges"})],
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
    menuHandler: createMenuKeyHandler(menu, context),
});

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
