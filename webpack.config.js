const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack')

module.exports = {
    entry: path.join(__dirname, 'src/index.js'), // 项目总入口js文件
    // 输出文件
    output: {
        path: path.join(__dirname, 'dist'), // 所有的文件都输出到dist/目录下
        filename: 'bundle.js',
    },
    devServer: {
        compress: true,
        port: 8080,
        hot: true,
        hotOnly: true
    },
    module: {
        rules: [{
                // 使用vue-loader解析.vue文件
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    // 要加上style-loader才能正确解析.vue文件里的<style>标签内容
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    // 处理顺序是从sass-loader到style-loader
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        // 当文件大小小于limit byte时会把图片转换为base64编码的dataurl，否则返回普通的图片
                        limit: 8192,
                        name: 'dist/assest/images/[name]-[hash:5].[ext]' // 图片文件名称加上内容哈希
                    }
                }]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/, // 不处理这两个文件夹里的内容
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(), // 最新版的vue-loader需要配置插件
        new HtmlWebpackPlugin({
            filename: 'index.html', // 生成的文件名称
            template: 'index.html', // 指定用index.html做模版
            inject: 'body' // 指定插入的<script>标签在body底部
        }),
       new CleanWebpackPlugin(), 
       new webpack.NamedModulesPlugin(), // 当接收到热更新信号时，打印文件模块等信息
       new webpack.HotModuleReplacementPlugin() // 热更新
    ]
};