const ngPackage = require('ng-packagr');
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const process = require('process');
const copy = require('./copy');

function reportDiagnostics(diagnostics) {
    diagnostics.forEach(diagnostic => {
        let message = 'Error';
        if (diagnostic.file) {
            const where = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ' ' + diagnostic.file.fileName + ' ' + where.line + ', ' + where.character + 1;
        }
        message += ': ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
}

function readConfigFile(configFileName) {
    // Read config file
    const configFileText = fs.readFileSync(configFileName).toString();

    // Parse JSON, after removing comments. Just fancier JSON.parse
    const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
    const configObject = result.config;
    if (!configObject) {
        reportDiagnostics([result.error]);
        process.exit(1);
    }

    // Extract config information
    const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        process.exit(1);
    }
    return configParseResult;
}

const buildType = process.argv[2];
const buildCallbacks = [
    {
        type: 'ngx-utils',
        cb: () => {
            ngPackage
                .ngPackagr()
                .forProject('ng-package.json')
                .withTsConfig('tsconfig.lib.json')
                .build()
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
        }
    },
    {
        type: 'tools',
        cb: () => {
            // Extract configuration from config file
            const config = readConfigFile(path.resolve('.', 'tools', 'tsconfig.json'));

            // Compile
            const program = ts.createProgram(config.fileNames, config.options);
            const emitResult = program.emit();

            // Report errors
            reportDiagnostics(ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

            // Copy files
            const targetDir = path.join('.', 'dist');
            copy(['./tools/**/*.js'], targetDir, 'tools');
        }
    },
];

if (!buildType) {
    buildCallbacks.forEach(t => t.cb());
} else {
    const build = buildCallbacks.find(t => t.type === buildType);
    if (!build) {
        console.log('Nothing to build because of wrong build type: ', buildType);
    } else {
        build.cb();
    }
}
