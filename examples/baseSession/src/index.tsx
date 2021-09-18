import React from "react";
import {
    Box,
    createSettings,
    createSettingsFolder,
    declare,
    FillBox,
    getContextContentStack,
    getContextFieldStack,
    getContextMenuStack,
    IIOContext,
    InstantChangeTransition,
    IOContextProvider,
    LFC,
    LMSession,
    LMSessionProvider,
    SlideDownOpenTransition,
    SlideLeftOpenTransition,
    SlideRightCloseTransition,
    SlideUpChangeTransition,
    SlideUpCloseTransition,
    StackView,
    UIPathView,
} from "@launchmenu/core";
import {IDataHook} from "model-react";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const ReverseApplicationLayout: LFC<{
    context: IIOContext;
    defaultTransitionDuration?: number;
}> = ({context, defaultTransitionDuration = 200}) => {
    const fieldStackGetter = (h?: IDataHook) => getContextFieldStack(context, h);
    const menuStackGetter = (h?: IDataHook) => getContextMenuStack(context, h);
    const contentStackGetter = (h?: IDataHook) => getContextContentStack(context, h);

    return (
        <IOContextProvider value={context}>
            <FillBox
                className="frame"
                display="flex"
                flexDirection="column"
                overflow="hidden">
                <Box position="relative" overflow="hidden" flexGrow={1} display="flex">
                    <Box
                        className="contentSection"
                        position="relative"
                        flexGrow={1}
                        flexShrink={1}
                        background="bgSecondary">
                        <StackView
                            ChangeTransitionComp={InstantChangeTransition}
                            stackGetter={contentStackGetter}
                        />
                    </Box>
                    <Box
                        className="menuSection"
                        position="relative"
                        background="bgTertiary"
                        flexShrink={0}
                        width="40%">
                        <StackView
                            OpenTransitionComp={SlideLeftOpenTransition}
                            CloseTransitionComp={SlideRightCloseTransition}
                            stackGetter={menuStackGetter}
                        />
                    </Box>
                </Box>
                <Box className="pathSection" background="bgPrimary">
                    <UIPathView
                        context={context}
                        pathTransitionDuration={defaultTransitionDuration}
                        heightTransitionDuration={defaultTransitionDuration}
                    />
                </Box>
                <Box
                    className="searchSection"
                    position="relative"
                    elevation="medium"
                    zIndex={100}
                    height={60}>
                    <StackView
                        OpenTransitionComp={SlideDownOpenTransition}
                        ChangeTransitionComp={SlideUpChangeTransition}
                        CloseTransitionComp={SlideUpCloseTransition}
                        stackGetter={fieldStackGetter}
                    />
                </Box>
            </FillBox>
        </IOContextProvider>
    );
};

class CustomLMSession extends LMSession {
    /** @override  */
    protected setupView(): void {
        this.view = (
            <LMSessionProvider value={this}>
                <ReverseApplicationLayout key={this.ID} context={this.context} />
            </LMSessionProvider>
        );
    }
}

export default declare({
    info,
    settings,
    init({LM}) {
        const session = new CustomLMSession(LM);
        const sessionManager = LM.getSessionManager();
        sessionManager.addSession(session);

        return {
            onDispose: () => {
                sessionManager.removeSession(session);
            },
        };
    },
});
