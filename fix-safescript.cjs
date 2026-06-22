const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "components", "MarketingSite.tsx");
let code = fs.readFileSync(filePath, "utf8");

// Find all instances of: <SafeScript     attrs={``}     code={"..."} />
// We need to carefully parse the JSON-like string.
// Actually, since it's `code={"..."}`, we can use a regex to capture everything between `code={"` and `"}`.
// But we have to be careful with inner quotes.
// In the current file, it seems the string was stringified. Let's see if we can use an AST or just a replacement.
// Let's write a simple replacer.

code = code.replace(/code=\{"(.*?)"\}/gs, (match, innerStr) => {
  // `innerStr` is a literal string where newlines are written as `\n` (two characters)
  // Let's unescape it properly.
  // We can evaluate it as a javascript string literal by wrapping it in quotes and parsing it with JSON.parse.
  let parsed;
  try {
    parsed = JSON.parse(`"${innerStr}"`);
  } catch (e) {
    // Try eval if JSON.parse fails due to single quotes or other issues, though the string itself was double quoted.
    try {
      parsed = eval(`"${innerStr}"`);
    } catch (e2) {
      console.error("Failed to parse:", innerStr.substring(0, 50));
      return match;
    }
  }

  // parsed is now the actual string. Wait, if it has `\\\\\\/`, we need to unescape more.
  // Wait, if it was `\\/` inside the JS string, it might still have too many backslashes.
  // Let's replace any `\\\\\\/` with `\\/` just in case, or `\\/` to `/`.
  // The string in MarketingSite.tsx is for example `(@gmail\\\\.|@yahoo\\\\.)`
  // `JSON.parse` will convert `\\\\` to `\\`.
  // So `(@gmail\\.|@yahoo\\.)`. That is the correct regex in JS! `/@gmail\./`.
  // Let's format it as a template literal to avoid escaping issues in React.

  // We should escape backticks and ${} in the unescaped code so it can be a template literal safely.
  let safeTemplate = parsed.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

  return `code={\`${safeTemplate}\`}`;
});

fs.writeFileSync(filePath, code);
console.log("Fixed SafeScript blocks in MarketingSite.tsx");
