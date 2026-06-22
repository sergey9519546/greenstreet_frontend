const fs = require('fs');
let c = fs.readFileSync('src/components/MarketingSite.tsx', 'utf8');

// Add useRef
c = c.replace(/import React, \{ useState, useEffect \} from "react";/, 'import React, { useState, useEffect, useRef } from "react";');

// Fix duplicate data-redirect
c = c.replace(/data-redirect="([^"]*)"\s+data-redirect="([^"]*)"/g, 'data-redirect="$1"');

// Fix string vs number on lines like <div data-delay="3000"
// Actually data- attributes are standard. The error might be about `tabIndex="0"` or `tabindex="0"`.
// React expects `tabIndex={0}` or `tabIndex={-1}`.
c = c.replace(/tabIndex=["'](-?\d+)["']/g, 'tabIndex={$1}');
// If it's a completely incorrect prop, like `delay="3000"`, the regex I used before was `redirect=`. Wait, maybe I accidentally renamed `data-delay` to `delay`? No, let's just make sure.

fs.writeFileSync('src/components/MarketingSite.tsx', c);
