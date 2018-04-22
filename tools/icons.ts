import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const svgPath = args[0];
const files = fs.readdirSync(svgPath);
const icons = {};
files.forEach(file => {
    const content = fs.readFileSync(path.join(svgPath, file));
    icons[file.replace(".svg", "")] = content.toString().replace(/\r?\n|\r/g, "");
});
fs.writeFileSync(args[1], "icons = " + JSON.stringify(icons) + ";");
