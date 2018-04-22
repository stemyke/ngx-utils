import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const basePath = args[0];
const scripts: string[] = [];

// Recursively find ts files in the given path
function readDir(dirPath): void {
    const paths = fs.readdirSync(dirPath);
    paths.forEach(p => {
        const subPath = path.join(dirPath, p);
        const stats = fs.lstatSync(subPath);
        if (stats.isDirectory()) {
            readDir(subPath);
            return;
        }
        if (path.extname(subPath) == ".ts" && path.basename(subPath).indexOf("spec.") < 0 && path.basename(subPath).indexOf("test.") < 0) {
            scripts.push(subPath);
        }
    });
}

const depMap: any = {};

let recursions: number = 0;

function matchSymbolReferences(scriptPath: string, content: string, symbol: string): void {
    const regex = new RegExp(": " + symbol + "(?:;|,|\\)| {)", "g");
    const nl = "\n";
    let match = regex.exec(content);
    while (match !== null) {
        let index = match.index;
        const lines = content.substr(0, index).split(nl);
        const line = lines.length;
        while (lines.length > 1) {
            index -= (lines.shift().length + nl.length);
        }
        index += nl.length + 2;
        console.log("Circular dependency found!", symbol, scriptPath, `${line}:${index}`);
        match = regex.exec(content);
        recursions++;
    }
}

function matchSymbols(scriptPath: string, content: string, regex: RegExp): void {
    let match = regex.exec(content);
    while (match !== null) {
        matchSymbolReferences(scriptPath, content.substr(0, match.index), match[1]);
        match = regex.exec(content);
    }
}

function matchFileReferences(scriptDir: string, content: string, mapItem: string[], regex: RegExp): void {
    let match = regex.exec(content);
    while (match !== null) {
        const importedScript = path.join(scriptDir, match[1]);
        mapItem.push(fs.existsSync(importedScript) ? path.join(importedScript, "index.ts") : `${importedScript}.ts`);
        match = regex.exec(content);
    }
}

function readScript(scriptPath): void {
    // Read file
    const scriptDir = path.dirname(scriptPath);
    const content = fs.readFileSync(scriptPath, "utf8");
    const mapItem = depMap[scriptPath] || [];
    // Find classes interfaces
    matchSymbols(scriptPath, content, /(?:class|interface) ((?:[a-z]|[A-Z]|[0-9]|_|-|\.)*) (?:(?:implements |extends )(?:(?:(?:[a-z]|[A-Z]|[0-9]|_|-|\.)*)(, | ))+){0,2}{/g);
    // Find types
    matchSymbols(scriptPath, content, /type ((?:[a-z]|[A-Z]|[0-9]|_|-|\.)*) =/g);
    // Find imports
    matchFileReferences(scriptDir, content, mapItem,  /import {(?:[a-z]|[A-Z]|[0-9]|_|-|\.|\*)*} from "(\..*)"/g);
    // Find exports
    matchFileReferences(scriptDir, content, mapItem, /export \* from "(\..*)"/g);
    depMap[scriptPath] = mapItem;
}

function findRecursion(scriptPath, path, dependents: string[], visitedFiles: Set<string>): void {
    dependents.forEach(dep => {
        if (visitedFiles.has(dep)) return;
        visitedFiles.add(dep);
        const subPath = Array.from(path);
        subPath.push(dep);
        if (scriptPath == dep) {
            console.log("Circular dependency found!", subPath.join(" -> "));
            recursions++;
        }
        if (!depMap[dep]) return;
        findRecursion(scriptPath, subPath, depMap[dep], visitedFiles);
    });
}

// Find ts files
readDir(basePath);

// Build depMap
scripts.forEach(readScript);

// Find recursions
Object.keys(depMap).forEach(scriptPath => findRecursion(scriptPath, [scriptPath], depMap[scriptPath], new Set<string>()));

if (recursions == 0) {
    console.log("No circular dependency found!");
}

// fs.writeFileSync(path.join(basePath, "deps.json"), JSON.stringify(depMap, null, 2));
