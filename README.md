# chart_zhaopin

No vue-cli，从零开始搭建项目架构。

项目最终的效果包括了引入vue框架；使用CSS预处理器；使用babel；引用图片等静态资源；开发热更新；区分开发环境与生成环境，并做相应优化等。基本接近真正做项目时候的配置。

## 开发步骤

### 创建项目

```
mkdir chart_zhaopin && cd chart_zhaopin

npm init

npm i vue --save
```

### 配置目录文件

配置完成后的目录

```
|-- dist
|-- src
|   |-- app.vue      
|   |-- index.js
|-- index.html
|-- package.json
|-- webpack.config.js
|-- postcss.config.js
```

### 安装项目依赖

安装依赖前需要注意一下两个语句的区别

``` --save-dev ``` ：安装好后写入package.json的devDepencies中（开发环境依赖）

 ``` --save ```  ：安装好后写入package.json的dependencies中（生产环境依赖）

 所以进入生产环境打包还需要对package.json的dependencies进行优化

1. 安装 webpack 和 vue-loader

webpack本身其实直接能处理的只有 js 资源，是通过各种 loader 让其他资源可以被 webpack 打包处理的。所以就还要安装 vue-loader。

```
npm i vue-loader webpack webpack-cli --save-dev
```

新建 webpack.config.js 写好基础配置。

2. 安装style-loader、css-loader，安装 vue-template-compiler 用于编译模版语法的 template

```
npm i style-loader css-loader vue-template-compiler --save-dev
```

3. 添加图片、CSS 预处理器等 loader

```
npm i file-loader url-loader node-sass sass-loader --save-dev
```

4. 添加 postcss-loader + autoprefixer，用于自动添加 css 浏览器前缀

```
npm i postcss-loader autoprefixer --save-dev
```

5. 添加 babel-loader，转译 es6 代码为 es5 代码

```
npm i babel-loader@7 babel-core babel-preset-env --save-dev
```

6. 添加 html-webpack-plugin，自动生成 index.html 的内容

添加 HtmlWebpackPlugin，打包后生成 index.html 页面，而且会自动加上对入口 js 的引用，它会把 webpack 配置里的 entry 当中指定的 js 都插入到生成的 index.html 中，而且当输出的文件添加上 hash 值时也可以自动跟踪。

```
npm i html-webpack-plugin --save-dev
```

7. 添加 clean-webpack-plugin，每次 build 之前可以自动先清除输出文件夹

```
npm i clean-webpack-plugin --save-dev
```

8. 添加 webpack-dev-server，本地服务器跑起来

```
npm i webpack-dev-server cross-env --save-dev
```

9. 配置热重载

在webpack.config.js载入webpack-dev-server中的 HotModuleReplacementPlugin，配置好devServer对象;

### 修改项目配置文件

在webpack.config.js 文件配置好其余依赖项，内容见项目对应文件；配置好以上对应的工具。

根目录下新建 ppostcss.config.js 文件 内容见项目对应文件用来 配置postcss-loader。

修改 package.json

```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "cross-env NODE_ENV=production webpack --config webpack.config.js",
    "start": "cross-env NODE_ENV=development webpack-dev-server --config webpack.config.js"
  },
```

这样就可以通过npm run start 命令启动本地服务器；通过 npm run build 来打包项目；

项目基础配置就完成了。

### 项目打包优化（待完善）


1. 配置生产环境 css 单独分离打包，方便浏览器缓存

```
npm i mini-css-extract-plugin --save-dev
```

2. 单独打包类库文件

因为类库文件是不用像业务代码一样经常更新的，单独打包可以让它们在浏览器里缓存，提高加载速度。

修改 webpack.config.js
