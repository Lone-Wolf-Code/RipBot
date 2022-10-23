const WebpackObfuscator = require('webpack-obfuscator');
module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            // eslint-disable-next-line no-param-reassign
            webpackConfig.resolve.fallback = {
                fs: false,
            };
            return webpackConfig;
        },
        plugins: {
            add: [
                new WebpackObfuscator({
                    compact: true,
                    selfDefending: true,                    
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    numbersToExpressions: true,
                    simplify: true,
                    stringArrayShuffle: true,
                    splitStrings: true,
                    stringArrayThreshold: 1,
                }),
            ],
        },
    },
}
