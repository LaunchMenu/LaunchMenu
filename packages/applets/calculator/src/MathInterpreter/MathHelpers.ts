const factorialCache: number[] = [];
const pFactorial = (n: number): number => {
    if (isNaN(n)) return 0;
    if (n == 0 || n == 1) return 1;
    if (factorialCache[n] > 0) return factorialCache[n];
    return (factorialCache[n] = pFactorial(n - 1) * n);
};

/**
 * Calculates the factorial of a number. If the number `n` is a non-integer (or >= 171) the digamma approximation is used instead.
 * @param n Number to calculate the factorial of
 */
export function factorial(n: number): {result: number; approx: boolean} {
    if (Math.floor(n) == n && n < 171) {
        return {result: pFactorial(n), approx: false};
    } else {
        //Use digamma
        let approximation =
            Math.sqrt(2 * Math.PI) *
            Math.exp(-n - 1) *
            Math.sqrt(1 / (n + 1)) *
            ((n + 1) *
                Math.sqrt(1 / (810 * (n + 1) ** 6) + (n + 1) * Math.sinh(1 / (n + 1)))) **
                (n + 1);
        return {result: approximation, approx: true};
    }
}

export function round(v: number, nDigits: number) {
    return Math.round(v * 10 ** nDigits) / 10 ** nDigits;
}
