/**
 * Retrieves the longest subsequence of two sequences
 * @param S1 The first sequence
 * @param S2 The second sequence
 * @param equals A function to determine whether two items in the sequences are equal
 * @returns A list of the indexes of sequence 1 and 2 that contained the same item
 */
export function getLCS<A, B>(
    S1: A[],
    S2: B[],
    equals: (a: A, b: B) => boolean = (a, b) => a == (b as any)
): [number, number][] {
    // Compute the table
    let L = [new Array(S2.length + 1).fill(0)];
    for (let i = 1; i <= S1.length; i++) L.push([0]);

    for (let i = 1; i <= S1.length; i++)
        for (let j = 1; j <= S2.length; j++)
            if (equals(S1[i - 1], S2[j - 1])) L[i][j] = L[i - 1][j - 1] + 1;
            else L[i][j] = Math.max(L[i - 1][j], L[i][j - 1]);

    // Retrieve the path
    let i = S1.length,
        j = S2.length;
    let out = [] as [number, number][];
    while (i > 0 && j > 0) {
        if (L[i][j] == L[i][j - 1]) {
            j--;
        } else if (L[i][j] == L[i - 1][j]) {
            i--;
        } else {
            i--;
            j--;
            out.unshift([i, j]);
        }
    }

    // Return the sequence
    return out;
}
