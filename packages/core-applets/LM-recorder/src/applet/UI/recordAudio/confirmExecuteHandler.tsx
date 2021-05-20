import React, {Fragment} from "react";
import {
    Box,
    Content,
    createAction,
    createStandardMenuItem,
    executeAction,
    FillBox,
    ICommand,
    Menu,
    sequentialExecuteHandler,
    UILayer,
} from "@launchmenu/core";
import {IConfirmable} from "./_types/IConfirmable";

export const confirmExecuteHandler = createAction({
    name: "Confirm",
    parents: [sequentialExecuteHandler],
    core: (confirmables: IConfirmable[]) => {
        // Collect the messages to display
        const {actionMessages, messages} = confirmables.reduce(
            ({actionMessages, messages}, {actionMessage, message}) => ({
                actionMessages:
                    !actionMessage || actionMessages.includes(actionMessage)
                        ? actionMessages
                        : [...actionMessages, actionMessage],
                messages:
                    !message || messages.includes(message)
                        ? messages
                        : [...messages, message],
            }),
            {actionMessages: [] as string[], messages: [] as string[]}
        );
        const mainMessage =
            actionMessages.length > 0
                ? `Are you sure you want to ${actionMessages.join("/")}?`
                : null;
        const allMessages = mainMessage ? [mainMessage, ...messages] : messages;

        // Collect the execute bindings
        const confirmBindings = confirmables.map(({onConfirm}) =>
            onConfirm instanceof Function
                ? executeAction.createBinding(onConfirm)
                : onConfirm
        );
        const cancelBindings = confirmables.flatMap(({onCancel}) =>
            onCancel instanceof Function
                ? executeAction.createBinding(onCancel)
                : onCancel
                ? onCancel
                : []
        );

        // Return the raw data plus sequential execute binding
        return {
            result: {
                messages: allMessages,
                confirmBindings,
                cancelBindings,
            },
            children: [
                sequentialExecuteHandler.createBinding(
                    ({context}) =>
                        new Promise<ICommand | void>(res => {
                            let cmd: ICommand | undefined;
                            context.open(
                                new UILayer(
                                    (context, close) => ({
                                        menu: new Menu(context, [
                                            createStandardMenuItem({
                                                name: "Confirm",
                                                onExecute: close,
                                                actionBindings: confirmBindings,
                                            }),
                                            createStandardMenuItem({
                                                name: "Cancel",
                                                onExecute: close,
                                                actionBindings: cancelBindings,
                                            }),
                                        ]),
                                        content: new Content(
                                            (
                                                <Fragment>
                                                    {allMessages.map((message, i) => (
                                                        <Box key={i}>{message}</Box>
                                                    ))}
                                                </Fragment>
                                            )
                                        ),
                                    }),
                                    {path: "Confirm"}
                                ),
                                {
                                    onClose: () => {
                                        res(cmd);
                                    },
                                }
                            );
                        })
                ),
            ],
        };
    },
});
