module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: ["plugin:import/typescript"],
    plugins: ["@typescript-eslint", "import"],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            rules: {
                "import/no-cycle": "error",
            },
        },
    ],
};
