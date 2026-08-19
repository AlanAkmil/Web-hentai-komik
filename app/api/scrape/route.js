import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://hentaiera.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'home'; // home, search, detail, reader
  const page = searchParams.get('page') || '1';
  const query = searchParams.get('q') || '';
  const id = searchParams.get('id') || ''; // ID atau path komik (misal: /gallery/12345/)

  try {
    // 1. ENDPOINT HOME & SEARCH
    if (action === 'home' || action === 'search') {
      let targetUrl = `${BASE_URL}/?page=${page}`;
      if (action === 'search' && query) {
        targetUrl = `${BASE_URL}/search/?q=${encodeURIComponent(query)}&page=${page}`;
      }

      const res = await fetch(targetUrl, { headers: HEADERS, next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const html = await res.text();
      const $ = cheerio.load(html);
      const items = [];

      // Loop setiap card gallery
      $('.gallery_thumb, .thumb, .gallery-item').each((_, el) => {
        const title = $(el).find('.caption, .title').text().trim() || $(el).find('img').attr('alt') || '';
        const rawLink = $(el).find('a').attr('href') || '';
        const cover = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

        if (rawLink) {
          items.push({
            id: rawLink.replace(/^\/|\/$/g, ''), // Bersihin slash
            title,
            cover: cover.startsWith('//') ? `https:${cover}` : cover,
            link: `${BASE_URL}${rawLink}`
          });
        }
      });

      return NextResponse.json({ success: true, action, page: Number(page), count: items.length, data: items });
    }

    // 2. ENDPOINT DETAIL KOMIK
    if (action === 'detail' && id) {
      const targetUrl = `${BASE_URL}/${id}/`;
      const res = await fetch(targetUrl, { headers: HEADERS, next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const html = await res.text();
      const $ = cheerio.load(html);

      const title = $('#info h1, .gallery_title').text().trim();
      const cover = $('#cover img').attr('data-src') || $('#cover img').attr('src') || '';
      
      const tags = [];
      $('.tag_container, .tag_btn').each((_, el) => {
        tags.push($(el).text().trim());
      });

      const totalPages = $('.thumb_container, .gthumb').length;

      return NextResponse.json({
        success: true,
        action: 'detail',
        data: {
          id,
          title,
          cover: cover.startsWith('//') ? `https:${cover}` : cover,
          tags,
          totalPages
        }
      });
    }

    // 3. ENDPOINT READER / CHAPTER IMAGES
    if (action === 'reader' && id) {
      const targetUrl = `${BASE_URL}/${id}/`;
      const res = await fetch(targetUrl, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const html = await res.text();
      const $ = cheerio.load(html);
      const images = [];

      // Scrape thumbnail gallery link buat dapet full image-nya
      $('.thumb_container img, .gthumb img').each((i, el) => {
        let thumbUrl = $(el).attr('data-src') || $(el).attr('src') || '';
        // Ubah URL thumbnail (t.jpg) jadi full resolution image (1.jpg, 2.jpg, dst)
        let fullImageUrl = thumbUrl.replace(/t\.jpg$/, '.jpg').replace(/t\.png$/, '.png');
        if (fullImageUrl.startsWith('//')) fullImageUrl = `https:${fullImageUrl}`;

        images.push({
          page: i + 1,
          image: fullImageUrl
        });
      });

      return NextResponse.json({ success: true, action: 'reader', total: images.length, images });
    }

    return NextResponse.json({ success: false, error: 'Invalid action or missing parameters' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
