import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HowItWorks } from './HowItWorks';

describe('HowItWorks accessibility', () => {
  it('renders one always-visible page heading without adding a main landmark', () => {
    const html = renderToStaticMarkup(createElement(HowItWorks));
    const headings = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/g) ?? [];

    expect(headings).toHaveLength(1);
    expect(headings[0]).toContain('Model a preliminary DSCR scenario in five steps.');
    expect(headings[0]).not.toContain('class="hiw-head"');
    expect(html).not.toMatch(/<main\b/);
  });
});
