import sanitize from "sanitize-html";

/**
 * Removes all tags from the given text
 * @param text The text to sanitize
 * @returns The plain text
 */
export function filterTags(text: string): string {
    return sanitize(text, {allowedTags: []});
}
