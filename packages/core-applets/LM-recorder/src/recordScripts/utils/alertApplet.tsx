import {
    Box,
    createAppletResultCategory,
    createContextAction,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    executeAction,
    IAppletInfo,
    IIOContext,
    LaunchMenu,
    Menu,
    searchAction,
    UILayer,
    withLM,
} from "@launchmenu/core";
import React from "react";
import ReactDOM from "react-dom";
// NOTE: this is a really hacky example applet, just because it's only used for recording. Don't use this as an example for a real applet

const info: IAppletInfo = {
    name: "Fake Alert",
    description: "A fake applet for demonstration purposes",
    version: "1.0.0",
    icon: "wifi",
};
const settings = createSettings({
    version: "0.0.0",
    settings: () => createSettingsFolder({...info, children: {}}),
});

export const alertApplet = declare({
    info,
    settings,
    init: ({LM}) => {
        const showAlert = ({
            context,
            element,
        }: {
            context: IIOContext;
            element: JSX.Element;
        }): void => {
            const target = document.createElement("div");
            document.body.appendChild(target);
            target.style.position = "absolute";
            target.style.left = "0px";
            target.style.top = "0px";
            target.style.right = "0px";
            target.style.bottom = "0px";
            ReactDOM.render(element, target);

            context.open(
                new UILayer((_, close) => ({
                    contentHandler: key => {
                        if (key.matches("esc")) {
                            close();
                            target.remove();
                            return true;
                        }
                    },
                }))
            );
        };

        const alertExecuteAction = createContextAction({
            name: "Alert",
            parents: [executeAction],
            core: (texts: string[]) => {
                texts = [...texts];
                const last = texts.pop();
                const baseText = (texts.length > 0
                    ? [texts.join(","), last].join(" and ")
                    : last ?? ""
                ).toLowerCase();
                const text = baseText
                    ? baseText[0].toUpperCase() + baseText.substring(1)
                    : "";
                return {
                    result: text,
                    children: [
                        executeAction.createBinding(({context}) =>
                            showAlert({
                                context,
                                element: (
                                    <Box
                                        position="absolute"
                                        background="bgPrimary"
                                        zIndex={100}
                                        padding="large"
                                        font="header"
                                        borderRadius="medium"
                                        css={{
                                            left: "50%",
                                            top: "30%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: 25,
                                            boxShadow:
                                                "0px 0px 26px 8px rgba(0,0,0,0.65)",
                                        }}>
                                        {text}.
                                    </Box>
                                ),
                            })
                        ),
                    ],
                };
            },
        });

        const loudAlertAction = createContextAction({
            name: "Loud alert!",
            core: (texts: string[]) => {
                texts = [...texts];
                const last = texts.pop();
                const baseText = (texts.length > 0
                    ? [texts.join(","), last].join(" and ")
                    : last ?? ""
                ).toLowerCase();
                const text = baseText
                    ? baseText[0].toUpperCase() + baseText.substring(1)
                    : "";
                return {
                    result: text,
                    actionBindings: [
                        executeAction.createBinding(({context}) =>
                            showAlert({
                                context,
                                element: (
                                    <Box
                                        position="absolute"
                                        background="bgPrimary"
                                        color="primary"
                                        zIndex={100}
                                        padding="large"
                                        font="header"
                                        borderRadius="medium"
                                        css={{
                                            left: "50%",
                                            top: "30%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: 40,
                                            boxShadow:
                                                "0px 0px 26px 8px rgba(0,0,0,0.65)",
                                        }}>
                                        {text}!
                                    </Box>
                                ),
                            })
                        ),
                    ],
                };
            },
        });

        const createItem = (name: string) =>
            createStandardMenuItem({
                name,
                actionBindings: [
                    alertExecuteAction.createBinding(name),
                    loudAlertAction.createBinding(name),
                ],
            });
        const items = [
            createItem("We're out of food"),
            createItem("Bob is at the door"),
            createItem("It's almost bob's birthday"),
        ];

        return {
            search: async () => ({children: searchAction.get(items)}),
            open: ({context, onClose}) => {
                context.open(new UILayer({menu: new Menu(context, items)}), {onClose});
            },
        };
    },
});
