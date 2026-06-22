const fs = require('fs');
let c = fs.readFileSync('src/components/MarketingSite.tsx', 'utf8');

const lines = c.split('\n');
if (lines[0].includes('useEffect') && lines[0].includes('useRef')) {
  lines.shift(); // remove duplicate import
  c = lines.join('\n');
}

c = c.replace(/\bautoPlay=["'][ ]*["']/g, 'autoPlay');
c = c.replace(/\bloop=["'][ ]*["']/g, 'loop');
c = c.replace(/\bmuted=["'][ ]*["']/g, 'muted');
c = c.replace(/\bplaysInline=["'][ ]*["']/g, 'playsInline');
c = c.replace(/\basync=["'][ ]*["']/g, 'async');
c = c.replace(/\bdefer=["'][ ]*["']/g, 'defer');
c = c.replace(/\tredirect=/g, ' data-redirect=');
c = c.replace(/\sredirect=/g, ' data-redirect=');
c = c.replace(/\btype=["']["']/g, 'type="button"');
c = c.replace(/\smax=/g, ' data-max=');
c = c.replace(/<div([^>]*)\bhref=/g, '<div$1 data-href=');
c = c.replace(/\bmaxlength=/g, 'maxLength=');

fs.writeFileSync('src/components/MarketingSite.tsx', c);
