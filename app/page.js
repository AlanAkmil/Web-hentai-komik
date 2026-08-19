'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const fetchData = async (pageNum = 1, searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scrape?page=${pageNum}&q=${encodeURIComponent(searchQuery)}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.error || 'Gagal mengambil data dari scraper.');
      }
    } catch (err) {
      setError('Error koneksi ke API server local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, search);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, search);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-pink-500 tracking-wider">
            HentaiEra <span className="text-white text-sm font-normal px-2 py-1 bg-pink-900/40 rounded border border-pink-700">Next.js Reader</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Lightweight web scraper & UI built with App Router & Cheerio</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex w-full md:w-96 gap-2">
          <input
            type="text"
            placeholder="Cari judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-pink-500 text-sm text-gray-200"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg text-sm transition"
          >
            Cari
          </button>
        </form>
      </header>

      {/* Debug Info Banner */}
      <div className="max-w-7xl mx-auto my-6 p-4 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-gray-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <span className="font-semibold text-pink-400">🔧 Tools Debug API Scrape:</span>
          <span className="ml-2">Tolong buka link ini untuk melihat json atau debug nya: </span>
          <a
            href={`/api/scrape?page=${page}&q=${encodeURIComponent(search)}`}
            target="_blank"
            rel="noreferrer"
            className="text-pink-400 underline hover:text-pink-300 break-all"
          >
            /api/scrape?page={page}&q={search}
          </a>
        </div>
        <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">Page {page}</span>
      </div>

      {/* Status States */}
      {loading && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400 text-sm">Sedang melakukan scraping data dari target...</p>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto bg-red-950/50 border border-red-800 text-red-200 p-6 rounded-lg text-center my-8">
          <p className="font-bold text-lg mb-1">Gagal Mengambil Data!</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Tidak ada data yang ditemukan. Coba keyword lain atau periksa koneksi proxy.
            </div>
          ) : (
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 my-6">
              {data.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition group flex flex-col justify-between"
                >
                  <div className="relative aspect-[3/4] bg-gray-950 overflow-hidden">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-600">No Cover</div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-medium text-gray-200 line-clamp-2 group-hover:text-pink-400 transition" title={item.title}>
                      {item.title}
                    </h3>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block text-center py-1.5 bg-gray-800 hover:bg-pink-600 text-white rounded text-[11px] font-medium transition"
                    >
                      Buka Detail
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="max-w-7xl mx-auto flex justify-center items-center gap-4 py-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-gray-300"
            >
              &larr; Prev
            </button>
            <span className="text-xs text-gray-400 font-medium">Halaman {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-semibold text-gray-300"
            >
              Next &rarr;
            </button>
          </div>
        </>
      )}
    </main>
  );
}
