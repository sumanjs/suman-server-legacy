// In webpack.config.js



module.exports = {
    entry: {
      index:  './server/lib-es5/pages/index/app.js',
      results:  './server/lib-es5/pages/results/app.js',
    },
    output: {
        path: __dirname + '/server/public/bundles',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: __dirname + '/server/lib-es5',
                loader: 'babel-loader'
            },
            {
                test: /\.json$/,
                include: __dirname + '/server/lib-es5',
                loader: 'json-loader'
            }
        ]
    },
    plugins: []
};