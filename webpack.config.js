const fs = require('fs');
const path = require("path");
const glob = require('glob');
const ManifestPlugin = require('webpack-manifest-plugin');

const WORKING_DIRECORY = path.resolve(__dirname, 'src');
const OUTPUT_DIRECORY = path.resolve(__dirname, 'dist');
const BUNDLE = [
  './script/app.mjs',
  './style/app.scss',
  './index.html',
  './sw.js',
  './editor.html',
  './style/editor.css',
  './manifest.json',
  './version.json'
];

Array.prototype.push.apply(BUNDLE, glob.sync("./script/editor/*.js", {cwd: WORKING_DIRECORY}));
Array.prototype.push.apply(BUNDLE, glob.sync("./fonts/**/*.*", {cwd: WORKING_DIRECORY}));
Array.prototype.push.apply(BUNDLE, glob.sync("./images/**/*.*", {cwd: WORKING_DIRECORY}));
Array.prototype.push.apply(BUNDLE, glob.sync("./database/*.json", {cwd: WORKING_DIRECORY}));
Array.prototype.push.apply(BUNDLE, glob.sync("./i18n/*.lang", {cwd: WORKING_DIRECORY}));
Array.prototype.push.apply(BUNDLE, glob.sync("./content/*.html", {cwd: WORKING_DIRECORY}));

let deepJSPath = path.resolve(__dirname, '../deepjs.2deep4real.de');

if (!fs.existsSync(deepJSPath)) {
    deepJSPath = path.resolve(__dirname, 'node_modules/deepJS');
}

module.exports = {
  mode: 'development',
  context: WORKING_DIRECORY,
  entry: {
		app: BUNDLE
	},
	output: {
		path: OUTPUT_DIRECORY,
		filename: './script/[name].min.js',
	},
  resolve: {
    alias: {
      ui: path.resolve(WORKING_DIRECORY, 'script/ui'),
      util: path.resolve(WORKING_DIRECORY, 'script/util'),
      deepJS: deepJSPath
    }
  },
  devServer: {
    contentBase: WORKING_DIRECORY,
    disableHostCheck: true,
    watchOptions: {
      ignored: ['release', 'node_modules']
    },
    open: true
  },
  plugins: [
    new ManifestPlugin({
      fileName: "index.json",
      writeToFileEmit: true,
      serialize: function(manifest) {
        let r = ["/"];
        for (let i in manifest) {
          let b = manifest[i];
          if (b.startsWith("./")) {
            b = b.slice(1);
          } else {
            b = "/" + b;
          }
          //if (b == "/sw.js") continue;
          r.push(b);
        }
        return JSON.stringify(r, null, 2);
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(WORKING_DIRECORY, 'script')
        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-env"]
          }
        }
      },
      {
        test: /\.scss$/,
        include: [
          path.resolve(WORKING_DIRECORY, 'style')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: './style/[name].min.css',
						}
					},
					{
						loader: 'extract-loader'
					},
          {
            loader: "css-loader?-url" // translates CSS into CommonJS
          },
					{
						loader: 'postcss-loader'
					},
          {
            loader: "sass-loader" // compiles Sass to CSS
          }
        ]
      },
      {
        test: /\.js$/,
        include: [
          WORKING_DIRECORY,
          path.resolve(WORKING_DIRECORY, 'script/editor')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      },
      {
        test: /\.css$/,
        include: [
          path.resolve(WORKING_DIRECORY, 'style')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      },
      {
        test: /\.html$/,
        include: [
          WORKING_DIRECORY,
          path.resolve(WORKING_DIRECORY, 'content')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      },
      {
        test: /\.(svg|png|gif|jpe?g)$/,
        include: [
          path.resolve(WORKING_DIRECORY, 'images')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      },
      {
        test: /\.(lang)$/,
        include: [
          path.resolve(WORKING_DIRECORY, 'i18n')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        include: [
          WORKING_DIRECORY,
          path.resolve(WORKING_DIRECORY, 'database')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      },
      {
        test: /\.(ttf|woff2?|eot|svg)$/,
        include: [
          path.resolve(WORKING_DIRECORY, 'fonts')
        ],
        use: [
					{
						loader: 'file-loader',
						options: {
              name: '[path][name].[ext]',
						}
					}
        ]
      }
    ]
  }
};
