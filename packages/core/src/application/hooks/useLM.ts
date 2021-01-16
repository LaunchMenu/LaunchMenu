import {createContext, useContext} from "react";
import {LaunchMenu} from "../LaunchMenu";

/** A context to store the current LM instance in */
export const LaunchMenuContext = createContext<LaunchMenu | null>(null);

/** A provider for the LM instance */
export const LaunchMenuProvider = LaunchMenuContext.Provider;

/** A hook to get the LaunchMenu instance */
export function useLM(): null | LaunchMenu {
    return useContext(LaunchMenuContext);
}
