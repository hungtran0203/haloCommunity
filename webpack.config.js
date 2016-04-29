var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        css: "./css/scss/index.scss",
        app: "./apps/halo/index.js"
    },
    output: {
        path: __dirname,
        filename: "./build/[name].bundle.js"
    },
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */["vendor1", "vendor2"], /* filename= */"./build/[name].bundle.js")
        new ExtractTextPlugin("./build/css/bundle.css")
    ],
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
            { test: /\.html$/, exclude: /node_modules/, loader: "html-loader" },
            { test: /\.scss$/, loader: ExtractTextPlugin.extract("style", "css!sass")},            
        ]
    }
};