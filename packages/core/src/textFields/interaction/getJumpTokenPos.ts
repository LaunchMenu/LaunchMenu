/**
 * Calculates the new position to jump to, based on the text, current position and direction
 * @param text The text to jump in, using the symbols and grouping them to determine the jump pos
 * @param pos The position the caret is currently in
 * @param direction The direction that should be jumped to (sign indicates direction, scale indicates number of groups to jump)
 * @param spaceIsGroup Whether to treat spaces as their own word group too
 */
export function getJumpTokenPos(
    text: string,
    pos: number,
    direction: number,
    spaceIsGroup?: boolean
): number {
    const cursorOffset = direction < 0 ? -1 : 0; // The cursor always looks to the character to the right, but should consider the character on the left when moving backwards
    const dir = direction < 0 ? -1 : 1;

    // Move as many groups as direction specifies
    while (direction != 0) {
        let charType: "word" | "symbol" | "space" | undefined = undefined;
        let newPos: number;

        // Move the cursor until the group is exited
        while (
            // Calculate the possible new position
            !void (newPos = pos + dir) &&
            // Check if that position is in the allowed range
            0 <= newPos &&
            newPos <= text.length
        ) {
            // Obtain the type of the character
            const char = text[pos + cursorOffset] ?? " ";
            let newType: "word" | "symbol" | "space";
            if (char.match(/\w/)) newType = "word";
            else if (char.match(/\s/)) newType = "space";
            else newType = "symbol";

            // Determine whether to stop going to the next pos
            if (newType == "space" && !spaceIsGroup) {
                // If a character group was already found, we found the end
                if (charType) break;
            } else {
                // If a character group was found but different, we found the end
                if (charType && charType != newType) break;
                charType = newType;
            }

            // Go to the next index
            pos = newPos;
        }

        // Decrease the scale of the direction by 1
        direction -= dir;
    }

    // Return the newly obtained position
    return pos;
}
