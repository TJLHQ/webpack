const path = require("path");
// html模板
const htmlPlugin = require('html-webpack-plugin');
// js代码压缩
const uglify = require('uglifyjs-webpack-plugin');
// css代码分离
const extractTextPlugin = require("extract-text-webpack-plugin")
var website = {
    publicPath: "http://localhost:8888/"
}
const glob = require('glob');
// 消除css多余的
const PurifyCSSPlugin = require("purifycss-webpack");
// 压缩css代码
const optimizeCss = require('optimize-css-assets-webpack-plugin');

const webpack = require("webpack")
module.exports = {
    mode: "development",
    entry: {
        main: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[hash].js',
        publicPath: website.publicPath,
        chunkFilename: '[name].chunk.js'
    },
    // 引入模块后缀，这样写模块就不用写后缀了
    resolve: {
        // 文件扩展名，写明以后就不需要每个文件写后缀
        extensions: ['.js', '.css', '.json'],
        // 路径别名，比如这里可以使用 css 指向 static/css 路径
        alias: {
            '@': path.resolve('src'),
            'css':path.resolve('static/css')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({  // 这里我们需要调用分离插件内的extract方法
                    fallback: 'style-loader',  // 相当于回滚，经postcss-loader和css-loader处理过的css最终再经过style-loader处理
                    use: ['css-loader', 'postcss-loader']
                })
            },
            {
                test: /\.less/,
                use: extractTextPlugin.extract({  // 这里我们需要调用分离插件内的extract方法
                    fallback: 'style-loader',  // 相当于回滚，经postcss-loader和css-loader处理过的css最终再经过style-loader处理
                    use: ['css-loader', 'postcss-loader','less-loader']
                })

            },
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].min.[ext]',
                            limit: 500,
                            // publicPath:'./',
                            // 打包图片到images
                            outputPath: 'images/'
                        }
                    }
                ]
            },
            // // 雪碧图
            // {
            //     loader:'img-loader',
            //     options:{
            //         pngquant:{
            //             pngquant:80
            //         }
            //     }
            // },
            // 字体图片
            // {
            //   test:/\.(eot|woff2?|ttf|svg)$/,
            //     use:[
            //         {
            //             loader:'url-loader',
            //             options:{
            //                 name:'[name].min.[ext]',
            //                 limit: 500,
            //                 publicPath:'/images',
            //                 // 打包图片到images
            //                 outputPath: 'font/'
            //             }
            //         }
            //     ]
            // },
            // html图片分离
            {
                test: /\.(htm|html)$/i,
                use: ['html-withimg-loader']
            }
        ]
    },
    plugins: [
        new htmlPlugin({
            // 找不到路由重定向
            historyApiFallback: true,
            minify: {
                removeAttributeQuotes: true
            },
            hash: true,
            template: './src/index.html'
        }),
        // 压缩js代码
        new uglify(),
        new extractTextPlugin("css/index.css"),
        new PurifyCSSPlugin({
            //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
            paths: glob.sync(path.join(__dirname, 'src/*.html')),
        }),
        // 压缩提取出的 CSS，并解决extractTextPlugin分离出的 JS 重复问题
        new optimizeCss({
            assetNameRegExp: /\.optimize\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {safe: true, discardComments: {removeAll: true}},
            canPrint: true
        }),
        new webpack.HotModuleReplacementPlugin(), // 热更新插件
    ],
    // 这个还待研究，看字面意思是优化的意思
    optimization: {
        // minimize: true,
        minimizer: [new optimizeCss({})],
    }
}