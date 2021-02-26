import {
    object,
    intersection,
    array,
    string,
    boolean,
    number,
    union,
    literal,
    ZodType,
} from "zod";
import {highlightLanguages} from "./_types/IHighlightLanguage";
import {inherit} from "./_types/IInherit";

// Not this was added after creating the TS declarations, it would be interesting to get these declarations using zod.

const inheritable = <T extends ZodType<any, any>>(type: T) =>
    union([type, literal(inherit)]).optional();

/** All the appearance related fields */
const appearanceMetadataSchema = object({
    color: inheritable(string()),
    syntaxMode: inheritable(
        string().refine(value => highlightLanguages.includes(value), {
            message: "Must be a valid supported language",
        })
    ),
    showRichContent: inheritable(boolean()),
    searchContent: inheritable(boolean()),
    fontSize: inheritable(number().min(0)),
});

/** A json schema validator to validate some json is valid notes and categories */
export const noteMetadataSchema = object({
    notes: array(
        object({
            ID: string(),
            name: string(),
            location: string(),
            modifiedAt: number(),
            categoryID: string().optional(),
        }).merge(appearanceMetadataSchema)
    ),
    categories: array(
        object({
            ID: string(),
            name: string(),
            searchPattern: string().optional(),
        }).merge(appearanceMetadataSchema)
    ),
});
