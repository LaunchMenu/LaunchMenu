import {createContext, useContext} from "react";
import {LMSession} from "../LMSession/LMSession";

/** A context to store the current LM session instance in */
export const LMSessionContext = createContext<LMSession | null>(null);

/** A provider for the LM session instance */
export const LMSessionProvider = LMSessionContext.Provider;

/** A hook to get the LM session instance */
export function useLMSession(): null | LMSession {
    return useContext(LMSessionContext);
}
