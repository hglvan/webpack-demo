let path = require('path');
let webpack = require('webpack');
console.log('__dirname', __dirname);
console.log('__filename', __filename);
console.log('resolve', path.resolve(__dirname, '/dist', 'a', '/b'));
console.log('join', path.join(__dirname, '/dist', 'a', '/b'));
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 多页面入口配置（对应原有HTML页面）
const entryConfig = {
  index: './src/index.js', // 首页入口
  demo: './src/demo.js', // 首页入口
};
// 多页面HTML插件配置
const htmlPlugins = Object.keys(entryConfig).map(name => {
  return new HtmlWebpackPlugin({
    filename: `${name}.html`, // 输出的HTML文件名
    template: `./public/index.html`, // 源HTML模板
    chunks: [name], // 关联对应的JS入口
    inject: 'body', // JS脚本注入到body末尾
    minify: {
      collapseWhitespace: false, // 开发环境不压缩，生产环境可设为true
      removeComments: false,
    },
  });
});
// 一个自定义插件，监听钩子
class MyPlugin {
  apply(compiler) {
    // 启动时
    compiler.hooks.run.tap('MyPlugin', () => {
      console.log('Webpack 开始打包～');
    });

    // 编译中
    compiler.hooks.compilation.tap('MyPlugin', () => {
      console.log('正在编译文件...');
    });

    // 输出前
    compiler.hooks.emit.tap('MyPlugin', () => {
      console.log('即将输出到 dist 目录');
    });

    // 完成
    compiler.hooks.done.tap('MyPlugin', () => {
      console.log('✅ 打包完成！');
    });
  }
}
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  // entry: './src/index.js',
  entry: entryConfig,
  output: {
    clean: true, // ✅ 自动清空 dist
    filename: '[name].[hash:8].js', // 输出JS文件到dist/js，加hash防缓存
    path: path.resolve(__dirname, 'dist'),
    // filename: './bundle.js'
  },
  plugins: [
    // 2. 在这里 new 一下即可使用
    new MyPlugin(),
    new webpack.BannerPlugin({
      banner: `@description: 项目打包文件demo`,
      // raw: false,      // 是否作为普通字符串（false=自动包装成注释）
      // entryOnly: false // false = 给所有文件加，true = 只给入口文件加
    }),
    // new CleanWebpackPlugin(), // 打包前清空dist目录
    // new MiniCssExtractPlugin({
    //   filename: 'css/[name].[hash:8].css' // 输出CSS到dist/css
    // }),
    ...htmlPlugins, // 扩展多页面HTML插件
  ],
  devServer: {
    // static: {
    //   directory: path.resolve(__dirname, 'dist'),
    // },
    port: 3000,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      // 处理 CSS
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 },
        },
        generator: {
          filename: 'img/[name].[contenthash:8][ext]',
        },
      },
      {
        test: /\.css/, // 匹配所有 .css 文件
        use: [
          //执行顺序，是从右到左的
          'style-loader', // 第二步：把 CSS 插入到 DOM
          'css-loader', // 第一步：解析 CSS
        ],
      },
    ],
  },
};
