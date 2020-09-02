import {useContext} from "react";
import {IOContextContext} from "./IOContextContext";

/**
 * Retrieves the IOContext from the component tree
 */
export const useIOContext = () => useContext(IOContextContext);
