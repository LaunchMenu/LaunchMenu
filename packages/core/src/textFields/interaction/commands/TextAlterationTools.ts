import {ITextAlterationInput} from "./_types/ITextAlterationInput";

export namespace TextAlterationTools {
    /**
     * Combines the given text alterations that were executed after the base alterations, to be in the form of the base alterations to be executable at the same time
     * @param base The base alterations in sorted order
     * @param alterations The alterations to merge with the base alterations
     * @param rebase Whether to rebase the alterations to be from the base's perspective, to be used when the alterations were made after the base changes were applied
     * @returns The alterations that can all be made at once to obtain an equivalent result
     *
     * @remarks This function is kind of thrown together. The logic hasn't been verified by anything else than a number of unit tests. It would be nice if we can find a cleaner proven algorithm sometime.
     */
    export function mergeAlterations(
        base: ITextAlterationInput[],
        alterations: ITextAlterationInput[],
        rebase: boolean = true
    ): ITextAlterationInput[] {
        // Note that this output will be reversed at the end
        const out: ITextAlterationInput[] = [];

        // Calculate all the offset amounts
        let offset = 0;
        const extendedBase = base
            .map(({start, end, text}) => {
                const delta = start - end + text.length;
                const oldOffset = offset;
                if (rebase) offset += delta;
                return {
                    relativeStart: oldOffset + start,
                    offset,
                    start,
                    end,
                    text,
                };
            })
            .reverse();
        let index = 0;

        // Iterate over all alterations to be merged
        let remaining = [...alterations];
        while (remaining.length > 0) {
            const {start, end, text} = remaining.pop() as ITextAlterationInput;

            // Go through all base alteration that came before, in order to properly merge
            insert: {
                while (index < extendedBase.length) {
                    const al = extendedBase[index];

                    // If the alteration is in front of the base group, simply add the base group it
                    if (end < al.relativeStart) {
                        out.push({
                            start: al.start,
                            end: al.end,
                            text: al.text,
                        });
                        index++;
                    }
                    // If the alteration starts before but overlaps, merge them
                    else if (start < al.relativeStart) {
                        const overlapStart = al.relativeStart;
                        const overlapEnd = Math.min(
                            al.relativeStart + al.text.length,
                            end
                        );

                        // Remove the overlapping section of the base group, and possibly even more after that
                        const alRemoveEnd = overlapEnd - al.relativeStart;
                        out.push({
                            text: al.text.slice(alRemoveEnd),
                            start: al.start,
                            end: al.end + (end - overlapEnd),
                        });

                        // Schedule the remainder of the alteration
                        remaining.push({
                            text,
                            start,
                            end: overlapStart,
                        });

                        // We're done with this base group
                        index++;
                        break insert;
                    }
                    // If the alteration starts after but overlaps, merge them
                    else if (start <= al.relativeStart + al.text.length) {
                        const overlapStart = start;
                        const overlapEnd = Math.min(
                            al.relativeStart + al.text.length,
                            end
                        );

                        // Remove the required text of the base group at the end, merge the aleration text into it, and possibly alter the removal amount at the end
                        const alRemoveStart = overlapStart - al.relativeStart;
                        const alRemoveEnd = overlapEnd - al.relativeStart;
                        al.text =
                            al.text.slice(0, alRemoveStart) +
                            text +
                            al.text.slice(alRemoveEnd);
                        al.end += end - overlapEnd;
                        break insert;
                    }
                    // If there is no overlap, add the alteration
                    else {
                        const offset = extendedBase[index]?.offset ?? 0;
                        out.push({
                            start: start - offset,
                            end: end - offset,
                            text,
                        });
                        break insert;
                    }
                }

                // If no group before exists, just add it
                out.push({start, end, text});
            }
        }

        // Add any remaining base alterations
        while (index < extendedBase.length) {
            const al = extendedBase[index++];
            out.push({
                start: al.start,
                end: al.end,
                text: al.text,
            });
        }

        // Reverse the output and join adjacent groups
        return mergeConsecutiveAlteration(out.reverse());
    }

    /**
     * Merges consecutive alterations together when possible
     * @param alterations The alterations to be merged
     * @returns The merged alterations
     */
    export function mergeConsecutiveAlteration(
        alterations: ITextAlterationInput[]
    ): ITextAlterationInput[] {
        const out: ITextAlterationInput[] = [];

        // Keep track of the previous data
        let prev: ITextAlterationInput = alterations[0];

        // Go through all alterations, and merge when possible
        for (let i = 1; i < alterations.length; i++) {
            const alteration = alterations[i];

            // If the next and previous alteration share a border, join them
            if (alteration.start == prev.end) {
                prev = {
                    start: prev.start,
                    end: alteration.end,
                    text: prev.text + alteration.text,
                };
            }
            // Otherwise add the previous to the output
            else {
                out.push(prev);
                prev = alteration;
            }
        }

        // Add the final alteration and return the result
        if (prev) out.push(prev);
        return out;
    }

    /**
     * Performs the specified alterations on a piece of text
     * @param text The text to perform the alterations on
     * @param alterations The alterations to perform, in sorted order
     * @returns The obtained text
     *
     * @remarks
     * Since this currently just uses string concatenation, it's not super efficient for big input.
     * In the future arrays and join could be used, making it faster for big inputs, but it would make things slower for small inputs.
     */
    export function performAlterations(
        text: string,
        alterations: ITextAlterationInput[]
    ): string {
        return alterations.reduceRight(
            (newText, {start, end, text}) =>
                newText.slice(0, start) + text + newText.slice(end),
            text
        );
    }
}
