module.exports = {
    roots: ["<rootDir>/src"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: ["./_tests/.*(?<!\\.helper|\\.setup)\\.tsx?"], // Any ts or tsx file in a _tests folder that doesn't end with .helper.ts
    verbose: false,
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json",
            diagnostics: false,
        },
    },
    coverageReporters: ["json", "html-spa", "text"],
    coveragePathIgnorePatterns: [".helper."],
    coverageDirectory: ".coverage",
    automock: false,
    moduleFileExtensions: ["ts", "tsx", "js"],
    transformIgnorePatterns: [],
    testEnvironment: "node",
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/src/_tests/fakeStaticFile.helper.ts",
    },
};
