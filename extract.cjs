const fs = require('fs');
const html = fs.readFileSync('C:\\\\Users\\\\serge\\\\.gemini\\\\antigravity-ide\\\\brain\\\\c7278b01-ed4a-4824-b045-f4195a575731\\\\.system_generated\\\\steps\\\\561\\\\content.md', 'utf8');
const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();
console.log(text);
