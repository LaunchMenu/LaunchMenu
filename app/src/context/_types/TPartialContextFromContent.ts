import {TPartialContextFromContent} from "./IOpenableContent";
import {TPartialContextFromField} from "./IOpenableField";
import {TPartialContextFromMenu} from "./IOpenableMenu";
import {TPartialContextFromKeyHandler} from "./IOpenableKeyHandler";

// prettier-ignore

/**
 * Extracts the part of the context that are required in order to open the specified UI
 */
export type TPartialContextFromOpenable<IOpenable> = 
    TPartialContextFromContent<IOpenable> & 
    TPartialContextFromField<IOpenable> & 
    TPartialContextFromMenu<IOpenable> & 
    TPartialContextFromKeyHandler<IOpenable>;
