let path = require('path');
let fs = require('fs');
let webpack = require('webpack');
console.log('__dirname', __dirname);
console.log('__filename', __filename);
console.log('resolve', path.resolve(__dirname, '/dist', 'a', '/b'));
console.log('join', path.join(__dirname, '/dist', 'a', '/b'));
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production',
});

// // 多页面入口配置（对应原有HTML页面）
// const entryConfig = {
//   index: './src/index.js', // 首页入口
//   demo: './src/demo.js', // 首页入口
// };
// console.log('.VITE_ENV ', process.env.VITE_ENV);

// // 多页面HTML插件配置
// const htmlPlugins = Object.keys(entryConfig).map(name => {
//   return new HtmlWebpackPlugin({
//     filename: `${name}.html`, // 输出的HTML文件名
//     template: `./public/index.html`, // 源HTML模板
//     chunks: [name], // 关联对应的JS入口
//     inject: 'body', // JS脚本注入到body末尾
//     minify: {
//       collapseWhitespace: false, // 开发环境不压缩，生产环境可设为true
//       removeComments: false,
//     },
//   });
// });
// 多页面入口配置（对应原有HTML页面）
// 1. 定义基础路径
const srcDir = path.resolve(__dirname, 'src');
function getEntry() {
  const entry = {};
  // 读取src目录下的所有文件/文件夹
  const files = fs.readdirSync(srcDir);
  console.log('files-files', files);
  files.forEach(file => {
    const filePath = path.join(srcDir, file);
    const fileStat = fs.statSync(filePath); //判断是文件还是文件夹，上面的files包含了文件、文件夹
    console.log('fileStat', fileStat.isFile());

    // 只处理 .js 文件（排除文件夹、非js文件）
    if (fileStat.isFile() && path.extname(file) === '.js') {
      // 入口名：去掉后缀（如 demo.js → demo）
      // console.log('file-file', po);
      const entryName = path.basename(file, '.js');
      // 入口路径：绝对路径
      entry[entryName] = filePath;
    }
  });

  return entry;
}
// 3. 动态生成 HtmlWebpackPlugin（每个页面对应一个HTML）
function getHtmlPlugins() {
  const entryKeys = Object.keys(getEntry());
  return entryKeys.map(entryName => {
    return new HtmlWebpackPlugin({
      filename: `${entryName}.html`, // 输出的HTML文件名（如 demo.html）
      chunks: [entryName], // 只引入当前页面的js
      template: path.resolve(__dirname, 'public/index.html'), // 公共HTML模板（需提前创建）
      inject: 'body', // js注入到body末尾
    });
  });
}
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
  entry: getEntry(),
  //重点，输出时看好filename设置文件夹名，还是publicPath设置，如果是filename设置，打包的js就会在zr文件夹里面，如果是publicPath设置，则只是在路径上有所体现
  //比如说，http://www.baidu.com/mm域名有mm之类的，那么资源放到根目录的话，就直接设置publicPath: '/zr/'
  output: {
    clean: true, // ✅ 自动清空 dist
    // 以前用hash，修改一个文件，其他也会更新，现在改用contenthash，只有当前文件更新
    filename: '[name].[contenthash:8].js', //(前面能不设置路径，就不设置吧，这里设置的话，就会多个zr文件包裹js) 输出JS文件到hg文件下面，加hash防缓存，也就是html引入js变成了<script defer="defer" src="/zr/hg/demo.4fa92a0d.js"></script>
    path: path.resolve(__dirname, 'dist'),
    // publicPath: '/zr/', //设置资源放置路径，比如放到服务器的zr文件下，域名就可以通过zr来访问了
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
    ...getHtmlPlugins(), // 扩展多页面HTML插件
    new ProgressBarPlugin({
      format: ' 打包中 [:bar] :percent (:elapsed 秒)', // 格式
      clear: false, // 完成后不清空进度条
      width: 30, // 进度条宽度
    }),
  ],
  devServer: {
    //不默认 “跑 src”，但默认编译 src/index.js 生成内存产物运行
    //想改 “编译的源码目录”：修改 entry（核心） + 配置 watchFiles（确保热更）
    static: {
      directory: path.resolve(__dirname, 'static'), //静态资源从 static 目录读取，就是说编译内存中找不到静态文件，会来这里找，默认是public
    },
    port: 3001,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      // 处理 CSS
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
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
