import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArtCard from "../components/ArtCard";
import api from "../services/api";

const CATEGORIES = ["All","Madhubani","Warli","Kalamkari","Pottery","Pattachitra","Weaving","Sculpture","Folk Art","Photography","Other"];

export default function Explore() {
  const [params] = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState(params.get("category") || "All");
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("-createdAt");
  const [price, setPrice]       = useState([0, 100000]);
  const [state, setState] = useState(params.get("state") || "");

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/artworks", {
        params: {
          category: category === "All" ? undefined : category,
          search: search || undefined,
          sort,
          minPrice: price[0] || undefined,
          maxPrice: price[1] < 100000 ? price[1] : undefined,
          page,
          limit: 12,
          state: state || undefined,
        }
      });
      setArtworks(data.artworks);
      setTotal(data.total);
      setPages(data.pages);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [category, search, sort, price, page,state]);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

  return (
    <div className="min-h-screen bg-deep">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-cream font-bold">Explore Indian Art</h1>
          <p className="text-cream-muted text-sm mt-1">{total} authentic artworks from verified artists across India</p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                 placeholder="Search art, artist, style…"
                 className="input-dark flex-1" />
          <select value={sort} onChange={e=>setSort(e.target.value)} className="input-dark w-full sm:w-48">
            <option value="-createdAt">Newest First</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="-views">Most Viewed</option>
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-2 mb-6">
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>{setCategory(c);setPage(1);}}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      category===c ? "bg-saffron text-deep border-saffron" : "text-cream-muted border-surface-3 hover:border-saffron/50 hover:text-cream"
                    }`}>{c}</button>
          ))}
        </div>
        {state && (
          <button onClick={() => setState("")} className="text-xs px-3 py-1 rounded-full bg-saffron/20 text-saffron">
            {state} x
          </button>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_,i)=>(
              <div key={i} className="bg-surface rounded-2xl aspect-square animate-pulse"/>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎨</div>
            <p className="text-cream text-lg">No artworks found</p>
            <p className="text-cream-muted text-sm mt-2">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artworks.map(art=><ArtCard key={art._id} artwork={art}/>)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(pages)].map((_,i)=>(
              <button key={i} onClick={()=>setPage(i+1)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                        page===i+1 ? "bg-saffron text-deep" : "bg-surface text-cream-muted hover:bg-surface-2"
                      }`}>{i+1}</button>
            ))}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}
