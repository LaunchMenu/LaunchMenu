import {getSeededRandom} from "../../../../_tests/seededRandom.helper";
import {TextAlterationTools} from "../TextAlterationTools";
import {ITextAlterationInput} from "../_types/ITextAlterationInput";

describe("TextAlterationTools", () => {
    describe("TextAlterationTools.mergeAlterations", () => {
        it("Should update the index to represent the index before the base alterations were made", () => {
            const combined = TextAlterationTools.mergeAlterations(
                [{start: 10, end: 15, text: "hi"}], // - 3 chars
                [{start: 20, end: 20, text: "orange"}]
            );

            expect(combined).toEqual([
                {start: 10, end: 15, text: "hi"},
                {start: 23, end: 23, text: "orange"},
            ]);

            const combined2 = TextAlterationTools.mergeAlterations(
                [
                    {start: 2, end: 2, text: "oran"}, // + 4 chars
                    {start: 10, end: 15, text: "hi"}, // - 3 chars
                    {start: 24, end: 28, text: "hi"}, // - 2 chars, after
                ],
                [{start: 20, end: 20, text: "orange"}]
            );

            expect(combined2).toEqual([
                {start: 2, end: 2, text: "oran"},
                {start: 10, end: 15, text: "hi"},
                {start: 19, end: 19, text: "orange"},
                {start: 24, end: 28, text: "hi"},
            ]);
        });
        describe("Should merge adjacent alterations", () => {
            it("Should merge properly at the start", () => {
                const combined = TextAlterationTools.mergeAlterations(
                    [{start: 10, end: 15, text: "hi"}], // - 3 chars, partially after
                    [{start: 11, end: 11, text: "orange"}]
                );

                expect(combined).toEqual([{start: 10, end: 15, text: "horangei"}]);

                const combined2 = TextAlterationTools.mergeAlterations(
                    [
                        {start: 2, end: 2, text: "oran"}, // + 4 chars
                        {start: 10, end: 15, text: "hi"}, // - 3 chars, partially after
                        {start: 24, end: 28, text: "hi"}, // - 2 chars, after
                    ],
                    [{start: 15, end: 18, text: "orange"}]
                );

                expect(combined2).toEqual([
                    {start: 2, end: 2, text: "oran"},
                    {start: 10, end: 17, text: "horange"},
                    {start: 24, end: 28, text: "hi"},
                ]);

                /*                
                    1. __________=====_________====__
                    2. __oran________hi_________hi__
                    3. __oran________horange_______hi__
                 */
            });
            it("Should merge properly at the end", () => {
                const combined = TextAlterationTools.mergeAlterations(
                    [{start: 10, end: 15, text: "hi"}], // - 3 chars, partially after
                    [{start: 8, end: 11, text: "orange"}]
                );

                expect(combined).toEqual([{start: 8, end: 15, text: "orangei"}]);

                const combined2 = TextAlterationTools.mergeAlterations(
                    [
                        {start: 2, end: 2, text: "oran"}, // + 4 chars
                        {start: 10, end: 15, text: "hi"}, // - 3 chars, partially after
                        {start: 24, end: 28, text: "hi"}, // - 2 chars, after
                    ],
                    [{start: 8, end: 15, text: "orange"}]
                );

                expect(combined2).toEqual([
                    {start: 2, end: 2, text: "oran"},
                    {start: 4, end: 15, text: "orangei"},
                    {start: 24, end: 28, text: "hi"},
                ]);

                /*                
                    1. __________=====_________====__
                    2. __oran________hi_________hi__
                    3. __oran__orangei_________hi__
                 */
            });
            it("Should merge properly when replacing a whole change", () => {
                const combined = TextAlterationTools.mergeAlterations(
                    [{start: 10, end: 15, text: "hi"}], // - 3 chars
                    [{start: 8, end: 13, text: "orange"}]
                );

                expect(combined).toEqual([{start: 8, end: 16, text: "orange"}]);

                const combined2 = TextAlterationTools.mergeAlterations(
                    [
                        {start: 2, end: 2, text: "oran"}, // + 4 chars
                        {start: 10, end: 15, text: "hi"}, // - 3 chars
                        {start: 24, end: 28, text: "hi"}, // - 2 chars, after
                    ],
                    [{start: 8, end: 20, text: "orange"}]
                );

                expect(combined2).toEqual([
                    {start: 2, end: 2, text: "oran"},
                    {start: 4, end: 19, text: "orange"},
                    {start: 24, end: 28, text: "hi"},
                ]);

                /*                
                    1. __________=====_________====__
                    2. __oran________hi_________hi__
                    3. __oran__orange_____hi__
                 */
            });
        });
        describe("Should deal with complex scenarios", () => {
            it("Should work properly with advanced alterations", () => {
                const inpText =
                    "oranges are cool stuff when bought in a set of 56. That's a magical number that will allow you to not eat them all at once, cus it be a ton of oranges.";

                const baseAlterations = [
                    {start: 5, end: 8, text: "POTATOES"},
                    {start: 8, end: 14, text: ""},
                    {start: 19, end: 19, text: "BOB"},
                    {start: 35, end: 45, text: "TOMATO"},
                ];

                const alterations = [
                    {start: 5, end: 10, text: ""},
                    {start: 13, end: 20, text: "ORANGE"},
                    {start: 22, end: 22, text: "PURPLE"},
                    {start: 45, end: 48, text: "PANTS"},
                ];

                testAlterationMerge(inpText, baseAlterations, alterations);
            });
            it("Should work properly with advanced alterations (Generated #663)", () => {
                const inpText =
                    "nqpkfgqeaarytfdobkyezicujqbyqxjzcdlgspkfmdwmkoywuaqtlrmcdkucvduudrryoxvvgqjefdsbqzgpyovbepkqhxzayhfsiomkgtaocrgrkjqgbrbjwqpkoxhm";

                const baseAlterations = [
                    {start: 18, end: 18, text: "QOSRB"},
                    // {start: 32, end: 45, text: ""},
                    // {start: 54, end: 54, text: "TUCFPXXJJBU"},
                    // {start: 81, end: 86, text: "UKGEHZBUB"},
                    // {start: 91, end: 91, text: "OXMMGZXXCOFXIA"},
                    // {start: 98, end: 98, text: "XAOYUMTGDPMLIRCHEICCJMGJ"},
                    // {start: 107, end: 107, text: "UGZT"},
                    // {start: 125, end: 125, text: "NRMHZVQBNWKSHXS"},
                ];

                const alterations = [
                    {start: 21, end: 21, text: "RPZWBSPDQFMHMYGP"},
                    {start: 21, end: 33, text: ""},
                    // {start: 42, end: 42, text: "AIHDXCSHDKERKTNTMMVGLTJ"},
                    // {start: 46, end: 47, text: "TC"},
                    // {start: 73, end: 79, text: "VR"},
                    // {start: 85, end: 86, text: "OMYTWDJXMGEPXOPTOSJXVJVV"},
                    // {start: 87, end: 95, text: ""},
                    // {start: 97, end: 107, text: ""},
                    // {start: 107, end: 108, text: ""},
                    // {start: 110, end: 120, text: ""},
                    // {start: 120, end: 120, text: "XJLUGVYGWCDWKKM"},
                    // {start: 128, end: 128, text: "DBZNFIXQSGDDR"},
                    // {start: 150, end: 150, text: "UTYZSGMWKXJDEGXL"},
                    // {start: 159, end: 159, text: "HMODX"},
                    // {start: 162, end: 162, text: ""},
                    // {start: 182, end: 182, text: "YKEJTQLCCLNSZK"},
                ];

                testAlterationMerge(inpText, baseAlterations, alterations);
            });
            it(`Should work properly on advanced alterations (Generated tests)`, () => {
                for (let i = 1; i < 1e3; i++) {
                    executeRandomAlterationMergeTest(i);
                }
            });
        });
    });
});

/**
 * Performs a test alteration merge test, for the given inputs
 * @param input The input text
 * @param baseAlterations The base alterations to merge
 * @param alterations The alterations to merge into the base alterations
 */
function testAlterationMerge(
    inpText: string,
    baseAlterations: ITextAlterationInput[],
    alterations: ITextAlterationInput[]
): void {
    // Execute the 2 steps of alterations separately
    const intermediateText = TextAlterationTools.performAlterations(
        inpText,
        baseAlterations
    );
    const finalText = TextAlterationTools.performAlterations(
        intermediateText,
        alterations
    );

    // Combine the 2 steps, and perform them at once
    const combinedAlterations = TextAlterationTools.mergeAlterations(
        baseAlterations,
        alterations
    );
    const finalTextMerged = TextAlterationTools.performAlterations(
        inpText,
        combinedAlterations
    );

    // Check these 2 things are equal
    expect(finalTextMerged).toEqual(finalText);
}

/**
 * Generates a random alteration merging test
 * @param seed The seed to generate the test with
 */
function executeRandomAlterationMergeTest(seed: number): void {
    const random = getSeededRandom(seed);

    // Generate the input text
    const inpLength = Math.floor(30 + random() * 200);
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const inpText = new Array(inpLength)
        .fill(0)
        .map(() => chars[Math.floor(random() * chars.length)])
        .join("");

    // Generate the base alterations
    const baseAlterations = generateAlterations(inpLength, random);

    // Get the intermediate text representation when these changes are applied
    const intermediateText = TextAlterationTools.performAlterations(
        inpText,
        baseAlterations
    );

    // Generate the further alterations
    const alterations = generateAlterations(intermediateText.length, random);

    // Obtain the final text
    const finalText = TextAlterationTools.performAlterations(
        intermediateText,
        alterations
    );

    // Combine the base and further alterations
    const combinedAlterations = TextAlterationTools.mergeAlterations(
        baseAlterations,
        alterations
    );
    const finalTextMerged = TextAlterationTools.performAlterations(
        inpText,
        combinedAlterations
    );

    // Check if the direct and are indirect approach yield equivalent results
    const testID = `#${seed.toString()}-`;
    try {
        expect(testID + finalTextMerged).toEqual(testID + finalText);
    } catch (e) {
        e.message += `\n text: "${inpText}" \n baseAlterations: ${JSON.stringify(
            baseAlterations
        )} \n alterations: ${JSON.stringify(alterations)}`;
        throw e;
    }
}

/**
 * Generates text alterations in a given range
 * @param inpLength The range in which alterations are allowed
 * @param random The function to use to create random values
 * @returns The alterations
 */
function generateAlterations(
    inpLength: number,
    random: () => number
): ITextAlterationInput[] {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const alterations: ITextAlterationInput[] = [];
    let index = 0;
    while (index < inpLength) {
        // Generate some start and end indices
        index += Math.floor(random() * 30);
        const start = index;
        index += random() > 0.5 ? 0 : Math.floor(random() * 15); // 50% chance of being a text insert
        const end = index;

        // Make sure the range is valid
        if (end < inpLength) {
            // Generate the replacement text, with 50% probability of being nothing
            const repLength =
                random() > 0.5 && end != start ? 0 : Math.floor(random() * 25);
            const text = new Array(repLength)
                .fill(0)
                .map(() => chars[Math.floor(random() * chars.length)])
                .join("");

            // Add the alteration
            alterations.push({start, end, text});
        }
    }

    return alterations;
}
