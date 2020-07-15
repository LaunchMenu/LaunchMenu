import React, {FC} from "react";
import {Menu} from "../menus/menu/Menu";
import {MenuView} from "../menus/menu/MenuView";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createMenuKeyHandler} from "../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {createStandardMenuItem} from "../menus/items/createStandardMenuItem";
import {ViewStack} from "../stacks/ViewStack";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {StackView} from "../components/stacks/StackView";
import {Action} from "../menus/actions/Action";

// Create some context action
const alertAction = new Action(
    (data: {message: string}[]) => {
        const text = data.map(({message}) => message).join(",");
        const execute = () => alert(text);
        return {
            execute,
            getMenuItem: (close: () => void) =>
                createStandardMenuItem({
                    name: "Alert All",
                    onExecute: () => {
                        execute();
                        close();
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
        getMenuItem: (close: () => void) =>
            createStandardMenuItem({
                name: "Sub Alert",
                onExecute: () => {
                    execute();
                    close();
                },
            }),
    };
});

// Create stacks and some menu
const viewStack = new ViewStack();
const inputStack = new KeyHandlerStack(new KeyHandler(document));
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
viewStack.push(<MenuView menu={menu} />);
inputStack.push(createMenuKeyHandler(menu, viewStack, inputStack));

export const MenuViewTest: FC = () => {
    return <StackView items={viewStack} />;
};
