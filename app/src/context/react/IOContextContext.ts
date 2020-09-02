import {createContext} from "react";
import {IIOContext} from "../_types/IIOContext";

/**
 * A context to store the IOContext in for component use
 */
export const IOContextContext = createContext<IIOContext | null>(null);

/**
 * A provider for the IOContexts
 */
export const IOContextProvider = IOContextContext.Provider;
