// vue3必须引入
// vue
// vue-loader
// @vue/compiler-sfc
// const { VueLoaderPlugin } = require('vue-loader');

// App.vue、index.js(生成vue实例,引入vue)、index.html三剑客
// 加入了router后,App.vue就要加入  <router-view></router-view>,而首页内容就用home.vue来承接

// 路径最好都用绝对路径,这样不容易出错
// const srcDir = path.resolve(__dirname, '../src'); //注意：以前配置webpack.config.js在根目录，就用./src，以此类推现在用config文件夹，那相对应的就要../src下了
// 1.安装webpack、webpack-cli、webpack-dev-server、css、图片复制、清空dist等跑起项目
// 2.加入vue、@vue/compiler-sfc、vue-router等支持vue框架
// 3.配置好入口出口,入口是以js为准的，出口是每个出口一个html-webpack-plugin实例，选择好模板

let path = require('path');
let fs = require('fs');
let webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //设置html模板，并插入js
const ProgressBarPlugin = require('progress-bar-webpack-plugin'); //构建进度
// 配置合并：用 webpack-merge 继承公共配置
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
console.log('MiniCssExtractPlugin', MiniCssExtractPlugin);
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// const { default: App } = require('../src/App.vue');

require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env.production',
});
console.log('process.env.NODE_ENV', CopyPlugin);

// 多页面入口配置（对应原有HTML页面）
// 1. 定义基础路径
const srcDir = path.resolve(__dirname, '../src'); //注意：以前配置webpack.config.js在根目录，就用./src，以此类推现在用config文件夹，那相对应的就要../src下了
function getEntry() {
  const entry = {};
  // 读取src目录下的所有文件/文件夹
  const files = fs.readdirSync(srcDir);
  // console.log('files-files', files);
  files.forEach(file => {
    const filePath = path.join(srcDir, file);
    const fileStat = fs.statSync(filePath); //判断是文件还是文件夹，上面的files包含了文件、文件夹
    // console.log('fileStat', fileStat.isFile());

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
  // console.log('entryKeys', entryKeys);

  return entryKeys.map(entryName => {
    return new HtmlWebpackPlugin({
      filename: `${entryName}.html`, // 输出的HTML文件名（如 demo.html）
      chunks: [entryName], // 只引入当前页面的js,对应上面的entry里面的key，如果不配这个，就只能单页面
      template: path.resolve(__dirname, `../public/index.html`), // 公共HTML模板（需提前创建）
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
console.log('getEntry()', getEntry());
module.exports = {
  // context: path.resolve(__dirname, '../'),

  performance: {
    //默认限制单个静态资源最好不要超过 244KiB
    hints: 'warning', // 关闭警告：false
    maxAssetSize: 500 * 1024, // 把限制改成 500KB
    maxEntrypointSize: 500 * 1024,
  },
  mode: 'production',
  // devtool: 'source-map', //开发用source-map，生产用nosources-source-map，既能显示错误行数，又不暴露源码
  // entry: { index: './src/index.js' },
  entry: getEntry(),
  //重点，输出时看好filename设置文件夹名，还是publicPath设置，如果是filename设置，打包的js就会在zr文件夹里面，如果是publicPath设置，则只是在路径上有所体现
  //比如说，http://www.baidu.com/mm域名有mm之类的，那么资源放到根目录的话，就直接设置publicPath: '/zr/'
  output: {
    clean: true, // ✅ 自动清空 dist
    // 以前用hash，修改一个文件，其他也会更新，现在改用contenthash，只有当前文件更新
    // 开发环境别用hash,生产才用,也就是分开配置文件,然后用webpack-merge合并
    filename: '[name].[contenthash:8].js', //(前面能不设置路径，就不设置吧，这里设置的话，就会多个zr文件包裹js) 输出JS文件到hg文件下面，加hash防缓存，也就是html引入js变成了<script defer="defer" src="/zr/hg/demo.4fa92a0d.js"></script>
    path: path.resolve(__dirname, '../dist'),
    // publicPath: './', //设置资源放置路径，比如放到服务器的zr文件下，域名就可以通过zr来访问了
  },
  resolve: {
    alias: {
      test: path.resolve(__dirname, '../src/css'),
    },
  },
  plugins: [
    new VueLoaderPlugin(), // 👈 2. 关键！必须写
    // 开启 gzip 压缩
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/, // 要压缩的文件
      threshold: 8192, // 大于 8KB 才压缩
      algorithm: 'gzip', // 压缩方式
      minRatio: 0.8, // 压缩比达标才压缩
      deleteOriginalAssets: false, // 不删除源文件（推荐 false）
    }),
    // 2. 在这里 new 一下即可使用
    new MyPlugin(),
    new webpack.BannerPlugin({
      banner: `@description: 项目打包文件demo`,
      // raw: false,      // 是否作为普通字符串（false=自动包装成注释）
      // entryOnly: false // false = 给所有文件加，true = 只给入口文件加
    }),
    // new CleanWebpackPlugin(), // 打包前清空dist目录，现在已经不用了，直接在output设置
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css', // 输出CSS到dist/css
      chunkFilename: 'css/[name].[contenthash:8].css', // 懒加载 CSS
    }),
    ...getHtmlPlugins(), // 扩展多页面HTML插件,扩展比如a，b，c三个页面，如何entry只有a.js，那么b、c页面也会引用a.js
    new ProgressBarPlugin({
      format: ' 打包中 [:bar] :percent (:elapsed 秒)', // 格式
      clear: false, // 完成后不清空进度条
      width: 30, // 进度条宽度
    }),
    new webpack.ProvidePlugin({
      //设置插件别名
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new CopyPlugin({
      // vue-cli-service,直接配置publicPath: './'就好了
      //把文件复制到另外一处，比如src里面的图片路径是img/，而打包后如果不用该插件，则访问不到，因为图片在src下面
      patterns: [
        // 从 public 复制 → 到 dist 根目录
        { from: path.join(__dirname, '../src/img'), to: path.join(__dirname, '../dist/img') },
      ],
    }),
  ],
  optimization: {
    // 开启压缩
    minimizer: [
      // 保留 Webpack 自带的 JS 压缩，默认自带 terser-webpack-plugin
      `...`,
      // 压缩 CSS
      new CssMinimizerPlugin({
        parallel: true, // 多线程加速（可选）
      }),
    ],
    splitChunks: {
      chunks: 'all', // 对所有模块分割（async + initial）
      minSize: 3 * 1024,
      cacheGroups: {
        //还可以单独打包某个依赖，比如jquery
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          enforce: true,
        },
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          // test: /\.(js)$/, // 👈 只抽 JS，**不抽 CSS！**
        },
      },
    },
    // minimize: false,
  },
  devServer: {
    //默认 “跑 src”，但默认编译 src/index.js 生成内存产物运行
    //想改 “编译的源码目录”：修改 entry（核心） + 配置 watchFiles（确保热更）
    // static: {
    //   directory: path.resolve(__dirname, './dist'),
    // },
    // static: {
    //   directory: path.resolve(__dirname, 'dsfsd'), //静态资源从 static 目录读取，就是说编译内存中找不到静态文件，会来这里找，默认是public
    // },
    port: 3001,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.vue/,
        loader: 'vue-loader',
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-loader', //ejs、handlebars是前面模板引擎，用了vue后，很少在用了
        options: {
          esModule: false,
        },
      },
      // 处理 CSS
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 },
        },
        generator: {
          filename: 'img/[name].[contenthash:2][ext]',
        },
      },
      {
        test: /\.css/, // 匹配所有 .css 文件
        use: [
          MiniCssExtractPlugin.loader, //替代style-loader，把css抽出来
          //执行顺序，是从右到左的
          // 'style-loader', // 第二步：把 CSS 插入到 DOM
          'css-loader', // 第一步：解析 CSS
        ],
      },
    ],
  },
};
