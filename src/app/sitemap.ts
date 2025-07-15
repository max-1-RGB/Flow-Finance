
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const pages = [
    '/',
    '/transactions',
    '/invoices',
    '/calendar',
    '/content-plan',
    '/idea-dump',
    '/equipment',
    '/settings',
    '/budgets',
    '/savings',
    '/insights',
    '/recurring',
    '/finbot',
    '/ai-suggestions',
    '/ai-forecast',
    '/ai-scan',
    '/quote-calculator',
    '/vcard',
    '/documents',
    '/receipts',
    '/customers',
    '/personnel',
    '/personnel/[id]',
    '/personnel/[id]/contracts/create',
    '/recruiting',
    '/team-calendar',
    '/audit',
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.replace('[id]', '1')}`, // Replace [id] with a sample ID
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: page === '/' ? 1 : 0.8,
  }));
}

    
