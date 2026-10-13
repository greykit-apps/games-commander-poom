/* Loads js/books/<set>.js into Node (they only set window.BOOKS). */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..", "..");
const ctx = {}; ctx.window = ctx;
vm.createContext(ctx);
for (const b of ["C", "D", "E", "H"]) vm.runInContext(fs.readFileSync(path.join(root, "js/books", b + ".js"), "utf8"), ctx);
module.exports = ctx.BOOKS;
