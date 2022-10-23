const WebpackObfuscator = require('webpack-obfuscator');
module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.resolve.fallback = {
                fs: false,
            };
            return webpackConfig;
        },
        plugins: {
            add: [
                new WebpackObfuscator({
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    debugProtection: true,
                    debugProtectionInterval: 4000,
                    disableConsoleOutput: true,
                    identifierNamesGenerator: 'hexadecimal',
                    log: false,
                    numbersToExpressions: true,
                    renameGlobals: false,
                    selfDefending: true,
                    simplify: true,
                    splitStrings: true,
                    splitStringsChunkLength: 5,
                    stringArray: true,
                    stringArrayCallsTransform: true,
                    stringArrayEncoding: ['rc4'],
                    stringArrayIndexShift: true,
                    stringArrayRotate: true,
                    stringArrayShuffle: true,
                    stringArrayWrappersCount: 5,
                    stringArrayWrappersChainedCalls: true,    
                    stringArrayWrappersParametersMaxCount: 5,
                    stringArrayWrappersType: 'function',
                    stringArrayThreshold: 1,
                    transformObjectKeys: true,
                    unicodeEscapeSequence: false
                }),
            ],
        },
    },
}
