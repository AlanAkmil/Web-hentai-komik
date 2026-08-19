import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const query = searchParams.get('q') || '';

  let targetUrl = `https://hentaiera.com/?page=${page}`;
  if (query) {
    targetUrl = `https://hentaiera.com/search/?q=${encodeURIComponent(query)}&page=${page}`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Failed to fetch target URL. Status: ${response.status}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    // Select gallery items
    $('.gallery, .gallery-item, .thumb, .item').each((_, el) => {
      const element = $(el);
      const title = element.find('.caption, .title, .caption-text, a.caption').text().trim() || element.find('a').attr('title') || 'Untitled';
      const link = element.find('a').attr('href') || '';
      
      let cover = element.find('img').attr('data-src') || 
                  element.find('img').attr('src') || 
                  element.find('img').attr('data-lazy-src') || '';

      if (cover.startsWith('//')) {
        cover = 'https:' + cover;
      }

      if (link && title) {
        results.push({
          id: link.replace(/[^a-zA-Z0-9]/g, '_'),
          title,
          link: link.startsWith('http') ? link : `https://hentaiera.com${link}`,
          cover
        });
      }
    });

    return NextResponse.json({
      success: true,
      page: Number(page),
      query,
      count: results.length,
      data: results
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
