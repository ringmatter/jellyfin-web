const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "amd-require"
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: ["file-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            appLoader: "<script>window.dashboardVersion='0.0.0';</script><script src='scripts/apploader.js?v=0.0.0' defer></script>",
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    devServer: {
        proxy: {
            '!/**/*.html' : 'http://192.168.1.9:8097/jellyfin',
            '!/**/*.css' : 'http://192.168.1.9:8097/jellyfin',
            '!/**/*.js' : 'http://192.168.1.9:8097/jellyfin'
        }
    }
});
