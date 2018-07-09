import {
    getJsFiles,
    shouldBeParsed,
    getFileExportMemberNames,
    hasJsExtension,
    buildMemberPathsMap
} from './lib';
import { name as packageName } from '../package.json'

test('shouldBeParsed(): invalidate wrong props', () => {
    expect(shouldBeParsed()).toBeFalsy();
    expect(shouldBeParsed('/path/to/smth')).toBeFalsy();
    expect(shouldBeParsed('/path/to/smth', 'smth2')).toBeFalsy();
});

test('shouldBeParsed(): validates project and dependency contents properly', () => {
    const projectName = 'project';
    const projectPath = `/path/to/${projectName}`;
    expect(shouldBeParsed(projectPath, projectName)).toBeTruthy();
    expect(shouldBeParsed(`${projectPath}/index.js`, projectName)).toBeTruthy();

    const dependencyName = 'dependency';
    const dependencyPath = `/path/to/${projectName}/node_modules/${dependencyName}`;
    expect(shouldBeParsed(dependencyPath, dependencyName)).toBeTruthy();
    expect(shouldBeParsed(`${dependencyPath}/index.js`, dependencyName)).toBeTruthy();

    const subDependencyPath = `${dependencyPath}/node_modules/pkg`;
    expect(shouldBeParsed(subDependencyPath, dependencyName)).toBeFalsy();
    expect(shouldBeParsed(`${subDependencyPath}index.js`, dependencyName)).toBeFalsy();
});

test('hasJsExtension(): should check if filename has *.js extension', () => {
    expect(hasJsExtension('Readme.md')).toBeFalsy();
    expect(hasJsExtension('index.js')).toBeTruthy();
})

test('getJsFiles(): should fetch all project javascript files except node_modules', () => {

    expect(getJsFiles()).toEqual([]);

    const currentProjectPath = process.cwd();
    const fileList = getJsFiles(currentProjectPath, packageName);
    
    expect(fileList).toContain(`${currentProjectPath}/index.js`);
    expect(fileList).not.toContain(`${currentProjectPath}/.babelrc`);
    expect(fileList).toContain(`${currentProjectPath}/example/index.js`);
    expect(fileList).not.toContain(`${currentProjectPath}/node_modules/are-we-there-yet/index.js`);
});

test('getFileExportMemberNames(): support empty members', () => {
    expect(getFileExportMemberNames()).toHaveLength(0);
});

test('getFileExportMemberNames(): support esm module `export`-s', () => {
    const currentProjectPath = process.cwd();
    let exportedMembers = getFileExportMemberNames(`${currentProjectPath}/example/bar/index.js`);
    expect(exportedMembers).toHaveLength(1);
    expect(exportedMembers).toMatchObject([ 'bar' ]);
    
    exportedMembers = getFileExportMemberNames(`${currentProjectPath}/example/bar/bar.js`);
    expect(exportedMembers).toHaveLength(1);
    expect(exportedMembers).toMatchObject([ 'bar' ]);
});

test('getFileExportMemberNames(): support esm `export default`', () => {
    const currentProjectPath = process.cwd();
    const exportedMembers = getFileExportMemberNames(`${currentProjectPath}/example/default.js`);
    expect(exportedMembers).toHaveLength(1);
    expect(exportedMembers).toMatchObject([ 'default' ]);
});

test('getFileExportMemberNames(): support CommonJS module.exports object', () => {
    const currentProjectPath = process.cwd();
    const exportedMembers = getFileExportMemberNames(`${currentProjectPath}/example/common.js`);
    expect(exportedMembers).toHaveLength(1);
    expect(exportedMembers).toMatchObject([ 'greet' ]);
});

test('getFileExportMemberNames(): `module.exports = value` consider as `export default`', () => {
    const currentProjectPath = process.cwd();
    const exportedMembers = getFileExportMemberNames(
        `${currentProjectPath}/example/commonAssign.js`
    );
    expect(exportedMembers).toHaveLength(1);
    expect(exportedMembers).toMatchObject([ 'default' ]);
});

test('buildMemberPathsMap(): support empty results', () => {
    expect(buildMemberPathsMap()).toMatchObject({});
});

test('buildMemberPathsMap(): properly sets member exports paths', () => {
    const currentProjectPath = process.cwd();
    const memberPathsMap = buildMemberPathsMap(currentProjectPath, packageName);
    expect(memberPathsMap['foo']).toContain(
        `${currentProjectPath}/example/index.js`
    );
    expect(memberPathsMap['foo']).toContain(
        `${currentProjectPath}/example/foo.js`
    );
    expect(
        memberPathsMap['bar'].indexOf(`${currentProjectPath}/example/bar/bar.js`)
    ).toBeLessThan(
        memberPathsMap['bar'].indexOf(`${currentProjectPath}/example/index.js`)
    );
});
