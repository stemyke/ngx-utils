const ngPackage = require('ng-packagr');
const process = require('process');

const buildType = process.argv[2];
const buildCallbacks = [
    {
        type: 'ngx-utils',
        cb: () => {
            ngPackage
                .ngPackagr()
                .forProject('ng-package.json')
                .withTsConfig('tsconfig.json')
                .build()
                .catch(error => {
                    console.error(error);
                    process.exit(1);
                });
        }
    }
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
