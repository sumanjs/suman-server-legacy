// In webpack.config.js



module.exports = {
    entry: {
      index:  './server/lib-es5/pages/index/app.js',
      results:  './server/lib-es5/pages/results/app.js',
      'babel-runtime': './server/lib-es6/pre-bundles/babel-runtime-pre.js'
    },
    output: {
        path: __dirname + '/server/public/bundles',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: __dirname,
                loader: 'babel-loader'
            },
            {
                test: /\.json$/,
                include: __dirname,
                loader: 'json-loader'
            }
        ]
    },
    plugins: []
};