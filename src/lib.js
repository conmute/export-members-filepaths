import * as fs from 'fs';

export function shouldBeParsed(nodePath, packageName) {
    const invalidPckgName = !packageName;
    const invalidNodePath = !(nodePath && nodePath.includes(packageName));
    if (invalidPckgName || invalidNodePath) {
        return false;
    }
    let re = false;
    let packageRelativePath = nodePath.split(packageName)[1];
    re = !/node_modules/g.test(packageRelativePath);
    return re;
}

export function hasJsExtension(fileName) {
    return /(.*\.js)$/.test(fileName)
}

export function getJsFiles(dir, packageName) {

    let results = [];

    if (!dir || !packageName) return results;

    fs.readdirSync(dir).forEach((file) => {
        const nodePath = `${dir}/${file}`;
        const stat = fs.statSync(nodePath);
        if (!stat) {
            return;
        }
        if (stat.isDirectory() && shouldBeParsed(nodePath, packageName)) {
            results = results.concat(getJsFiles(nodePath, packageName));
        }
        if (!hasJsExtension(file)) {
            return;
        }
        if (stat.isFile()) {
            results.push(nodePath);
        }
    });

    return results;
}

export function getFileExportMemberNames(modulePath) {
    let re = []
    if (!modulePath) {
        return re;
    }
    const m = require(modulePath)
    re = typeof m === 'object' ? Object.keys(m) : [ 'default' ];
    return re;
}

export function buildMemberPathsMap(dirPath, packageName) {
    const files = getJsFiles(dirPath, packageName);
    return files.reduce((accum, file) => {
        getFileExportMemberNames(file).forEach(memberName => {
            accum[memberName] = (accum[memberName] || []).concat(file);
        });
        return accum
    }, {})
}
