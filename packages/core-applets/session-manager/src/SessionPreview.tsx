import React, {createContext, useContext} from "react";
import {Box, LFC, LMSession} from "@launchmenu/core";

export const RenderCounter = createContext(0);

/**
 * A component to render the preview content for a session
 */
export const SessionPreview: LFC<{session: LMSession}> = ({session}) => {
    // Prevent rendering an infinite loop
    const count = useContext(RenderCounter);
    if (count >= 1) return <Box />;
    return (
        <RenderCounter.Provider value={count + 1}>{session.view}</RenderCounter.Provider>
    );
};
