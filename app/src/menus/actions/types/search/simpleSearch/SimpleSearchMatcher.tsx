import React from "react";
import {IQuery} from "../../../../menu/_types/IQuery";
import {
    simpleMatchRetriever,
    ISimpleSearchQuery,
    isSimpleSearchQuery,
} from "./_types/ISimpleSearchQuery";
import {Highlight} from "../../../../../components/Highlight";
import execWithIndices from "regexp-match-indices";

/**
 * A class to create a simple search matcher that can be used to determine whether given text matches
 * as well as to highlight the given text
 */
export class SimpleSearchMatcher {
    protected search: string;

    protected regex?: RegExp;
    protected words?: string[];

    /**
     * Creates a new simple search matcher
     * @param search The search to be matched
     */
    public constructor(search: string) {
        this.search = search;
        let m: RegExpMatchArray | null;
        if ((m = search.match(/^r:(.*)$/))) {
            console.log(m);
            this.regex = new RegExp(m[1]);
        } else {
            this.words = search
                .replace(/\w+\:/, "")
                .split(" ")
                .map(word => word.toLowerCase())
                .filter(Boolean);
        }
    }

    /**
     * Retrieves how well the given text is matched
     * @param text The text to be matched
     * @returns A number representing how well the text matches (higher = better)
     */
    public match(text: string): number {
        // If the search is empty, return everything with priority 1
        if (this.search.length == 0) return 1;

        if (this.regex) {
            const match = this.regex.exec(text);
            if (!match) return 0;
            else {
                if (match.length == 1) return match[0].length;
                // Ignore the overall match length if there are capture groups
                else return match.slice(1).reduce((cur, group) => cur + group.length, 0);
            }
        }

        if (this.words) {
            text = text.toLowerCase();
            const result = this.words.reduce(
                (cur, word) => cur + (text.includes(word) ? word.length : 0),
                0
            );
            return result;
        }

        return 0;
    }

    /**
     * Highlights the given text according to the search
     * @param text The text to highlight
     * @returns The element with the given text and highlighting
     */
    public highlight(text: string): JSX.Element {
        const lowerText = text.toLowerCase();
        if (this.regex) {
            const match = execWithIndices(this.regex, lowerText);
            if (!match) return <>{text}</>;
            else {
                if (match.length == 1)
                    return this.highlightSections(text, [
                        [match.index, match.index + match[0].length],
                    ]);
                else return this.highlightSections(text, match.indices);
            }
        }

        if (this.words) {
            const indices = this.words.reduce<[number, number][]>((cur, word) => {
                const index = lowerText.indexOf(word, cur[cur.length - 1]?.[1] ?? 0);
                if (index != -1) return [...cur, [index, index + word.length]];
                return cur;
            }, []);
            return this.highlightSections(text, indices);
        }

        return <>{text}</>;
    }

    /**
     * Highlights the specified sections in the text
     * @param text The text to highlight the sections in
     * @param sections The sections to highlight (in any order)
     * @returns An element with the specified sections highlighted
     */
    protected highlightSections(text: string, sections: [number, number][]): JSX.Element {
        sections.sort(([, a], [, b]) => a - b);

        let parts = [] as (JSX.Element | string)[];
        let prevEndIndex = 0;

        sections.forEach(([start, end]) => {
            parts.push(text.substring(prevEndIndex, start));
            parts.push(<Highlight key={start}>{text.substring(start, end)}</Highlight>);
            prevEndIndex = end;
        });
        parts.push(text.substring(prevEndIndex, text.length));

        return <>{...parts}</>;
    }
}

/**
 * Retrieves and caches the matcher from and within the query
 * @param query The query to get the matcher for
 * @returns The matcher for the query
 */
export function getSimpleSearchMatcher(
    query: IQuery & Partial<ISimpleSearchQuery>
): SimpleSearchMatcher {
    if (isSimpleSearchQuery(query)) return query[simpleMatchRetriever];

    return (query[simpleMatchRetriever] = new SimpleSearchMatcher(query.search));
}
