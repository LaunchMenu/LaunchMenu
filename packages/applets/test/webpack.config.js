const path = require("path");
const build = path.join(process.cwd(), "build");
const src = path.join(process.cwd(), "src");

const WriteFilePlugin = require("write-file-webpack-plugin");

const rules = [
    {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
    },
    {
        test: /(\.png|\.jpg|\.html|\.ttf)$/,
        loader: "file-loader",
        options: {
            outputPath: (url, resourcePath, context) =>
                resourcePath.substring(src.length),
        },
    },
];

module.exports = env => {
    const mode = env == "prod" ? "production" : "development";
    return [
        {
            target: "electron-renderer",
            node: {
                __dirname: false, // allows usage of __dirname in code
                __filename: false, // allows usage of __filename in code
            },
            entry: ["./src/index.tsx"],
            devtool: mode == "production" ? undefined : "inline-source-map",
            mode,
            module: {
                rules,
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
            },
            output: {
                filename: "applet.js",
                path: build,
            },
            plugins: [new WriteFilePlugin()],
        },
    ];
};
