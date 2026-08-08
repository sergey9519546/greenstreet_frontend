/**
 * Research Retriever Engine
 * Programmatic access and search retriever across all 1,000+ research papers,
 * whitepapers, lender matrices, state PPP laws, datasets, and obsidian notes.
 */

import masterIndex from './data/MASTER_RESEARCH_INDEX.json';

export interface ResearchDocMatch {
  title: string;
  path: string;
  sizeBytes: number;
  category: string;
  keywords: string[];
  relevanceScore: number;
}

export class ResearchRetriever {
  private static instance: ResearchRetriever;
  private documents: Array<{
    title: string;
    path: string;
    size_bytes: number;
    category: string;
    keywords: string[];
  }> = [];

  private constructor() {
    this.documents = (masterIndex as any).documents || [];
  }

  public static getInstance(): ResearchRetriever {
    if (!ResearchRetriever.instance) {
      ResearchRetriever.instance = new ResearchRetriever();
    }
    return ResearchRetriever.instance;
  }

  public getTotalDocumentCount(): number {
    return this.documents.length;
  }

  public queryResearch(query: string, categoryFilter?: string, maxResults: number = 10): ResearchDocMatch[] {
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const matches: ResearchDocMatch[] = [];

    for (const doc of this.documents) {
      if (categoryFilter && doc.category !== categoryFilter) {
        continue;
      }

      const titleLower = doc.title.toLowerCase();
      const pathLower = doc.path.toLowerCase();
      const kwLower = doc.keywords.map(k => k.toLowerCase()).join(' ');

      let score = 0;
      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        if (pathLower.includes(term)) score += 5;
        if (kwLower.includes(term)) score += 3;
      }

      if (score > 0) {
        matches.push({
          title: doc.title,
          path: doc.path,
          sizeBytes: doc.size_bytes,
          category: doc.category,
          keywords: doc.keywords,
          relevanceScore: score
        });
      }
    }

    return matches
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  public getWhitepapers(): ResearchDocMatch[] {
    return this.queryResearch('whitepaper master blueprint', 'whitepapers', 20);
  }

  public getLenderResearch(): ResearchDocMatch[] {
    return this.queryResearch('lender wholesale matrix non-qm', 'lender_intelligence', 20);
  }

  public getComplianceResearch(): ResearchDocMatch[] {
    return this.queryResearch('state ppp law compliance penalty', 'compliance_laws', 20);
  }
}
