const path = require("path");
const build = path.join(process.cwd(), "build");
const src = path.join(process.cwd(), "src");

const NodemonPlugin = require("nodemon-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const rules = [
    {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
    },
    {
        test: /(\.png|\.jpg|\.html)$/,
        loader: "file-loader",
        options: {
            name: "[path][name].[ext]",
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
            entry: ["./src/app.tsx", "./src/index.html"],
            devtool: mode == "production" ? undefined : "inline-source-map",
            mode,
            module: {
                rules,
            },
            devServer: {
                contentBase: [build],
                compress: true,
                port: 3000,
                historyApiFallback: true,
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
            },
            output: {
                filename: "app.js",
                path: build,
            },
            plugins: [
                new WriteFilePlugin(),
                new CopyPlugin({
                    patterns: [
                        {
                            from: path.join(src, "index.html"),
                            to: path.join(build, "index.html"),
                        },
                    ],
                }),
            ],
        },
        {
            target: "electron-main",
            node: {
                __dirname: false, // allows usage of __dirname in code
                __filename: false, // allows usage of __filename in code
            },
            entry: "./src/index.ts",
            devtool: mode == "production" ? undefined : "inline-source-map",
            mode,
            module: {
                rules,
            },
            watch: true,
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
            },
            output: {
                filename: "index.js",
                path: build,
            },
            plugins: [
                new WriteFilePlugin(),
                new NodemonPlugin({
                    script: path.join(build, "index.js"),
                    execMap: {
                        js: `set NODE_ENV=${mode}&& electron `,
                    },
                    watch: path.join(build, "index.js"),
                    delay: "1000", // ms
                    verbose: true,
                }),
            ],
        },
    ];
};
