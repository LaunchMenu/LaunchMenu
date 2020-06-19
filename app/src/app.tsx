import * as fs from "fs";

console.log("I sucks");
fs.readdir(process.cwd(), (err, files) => {
    console.log(files);
});
