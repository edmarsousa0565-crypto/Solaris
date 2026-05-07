'use client';

import { motion } from 'motion/react';
import { SfButton } from '@storefront-ui/react';
import type { CJProduct } from '../hooks/useCJProducts';
import { CJ_CATEGORIES } from './adminUtils';

interface Props {
  activeSupplier: 'cj' | 'matterhorn' | 'eprolo';
  setActiveSupplier: (s: 'cj' | 'matterhorn' | 'eprolo') => void;
  searchMode: 'name' | 'pid';
  setSearchMode: (m: 'name' | 'pid') => void;
  searchInput: string;
  setSearchInput: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  page: number;
  setPage: (p: number | ((p: number) => number)) => void;
  products: CJProduct[];
  total: number;
  loading: boolean;
  mhProducts: any[];
  mhLoading: boolean;
  mhTotal: number;
  mhHasMore: boolean;
  mhPage: number;
  setMhPage: (p: number | ((p: number) => number)) => void;
  mhSearchInput: string;
  setMhSearchInput: (s: string) => void;
  setMhSearch: (s: string) => void;
  mhNewOnly: boolean;
  setMhNewOnly: (v: boolean | ((v: boolean) => boolean)) => void;
  epProducts: any[];
  epLoading: boolean;
  epTotal: number;
  epHasMore: boolean;
  epPage: number;
  setEpPage: (p: number | ((p: number) => number)) => void;
  epSearchInput: string;
  setEpSearchInput: (s: string) => void;
  setEpSearch: (s: string) => void;
  epCategories: any[];
  epWareTypeId: string;
  setEpWareTypeId: (id: string) => void;
  epSearchMode: 'name' | 'pid';
  setEpSearchMode: (m: 'name' | 'pid') => void;
  featuredPids: string[];
  saving: string | null;
  toggleFeatured: (product: CJProduct) => void;
  openDetails: (product: CJProduct) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export default function AdminBrowse({
  activeSupplier, setActiveSupplier, searchMode, setSearchMode,
  searchInput, setSearchInput, category, setCategory, page, setPage,
  products, total, loading,
  mhProducts, mhLoading, mhTotal, mhHasMore, mhPage, setMhPage, mhSearchInput, setMhSearchInput, setMhSearch, mhNewOnly, setMhNewOnly,
  epProducts, epLoading, epTotal, epHasMore, epPage, setEpPage, epSearchInput, setEpSearchInput, setEpSearch,
  epCategories, epWareTypeId, setEpWareTypeId, epSearchMode, setEpSearchMode,
  featuredPids, saving, toggleFeatured, openDetails, handleSearch,
}: Props) {
  const isMh = activeSupplier === 'matterhorn';
  const isEp = activeSupplier === 'eprolo';
  const currentList = isMh ? mhProducts : isEp ? epProducts : products;
  const isLoading = isMh ? mhLoading : isEp ? epLoading : loading;
  const currentTotal = isMh ? mhTotal : isEp ? epTotal : total;
  const currentPage = isMh ? mhPage : isEp ? epPage : page;
  const canGoNext = isMh ? mhHasMore : isEp ? epHasMore : currentPage * 24 < currentTotal;

  const handleMhSearch = (e: React.FormEvent) => { e.preventDefault(); setMhSearch(mhSearchInput); setMhPage(1); };
  const handleEpSearch = (e: React.FormEvent) => { e.preventDefault(); setEpSearch(epSearchInput); setEpPage(1); };
  const activeForm = isMh ? handleMhSearch : isEp ? handleEpSearch : handleSearch;

  const activeInput = isMh ? mhSearchInput : isEp ? epSearchInput : searchInput;
  const setActiveInput = isMh ? setMhSearchInput : isEp ? setEpSearchInput : setSearchInput;

  return (
    <motion.div
      key="browse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Supplier selector */}
      <div className="sticky top-12 z-50 bg-deep-night border-b border-stark-white/10 px-8 md:px-12 py-2 flex gap-1">
        {([['cj', 'CJ Dropshipping'], ['matterhorn', 'Matterhorn'], ['eprolo', 'Eprolo']] as const).map(([s, label]) => (
          <button
            key={s}
            onClick={() => { setActiveSupplier(s); setPage(1); setMhPage(1); setEpPage(1); }}
            className={`font-mono text-[11px] tracking-widest uppercase px-4 py-1.5 border transition-colors ${
              activeSupplier === s
                ? 'bg-solar-yellow text-absolute-black border-solar-yellow'
                : 'border-stark-white/20 text-stark-white/50 hover:text-stark-white hover:border-stark-white/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="sticky top-[5.5rem] z-40 bg-raw-linen/95 backdrop-blur-sm border-b border-absolute-black/10 px-8 md:px-12 py-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <form onSubmit={activeForm} className="flex gap-0 border border-absolute-black/20 focus-within:border-absolute-black transition-colors">
            {/* Toggle Nome/PID — CJ e Eprolo */}
            {(!isMh) && (
              <button
                type="button"
                onClick={() => {
                  if (isEp) setEpSearchMode(epSearchMode === 'name' ? 'pid' : 'name');
                  else { setSearchMode(searchMode === 'name' ? 'pid' : 'name'); setPage(1); }
                }}
                className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border-r transition-colors shrink-0 ${
                  (isEp ? epSearchMode : searchMode) === 'pid'
                    ? 'bg-solar-yellow text-absolute-black border-solar-yellow/50'
                    : 'bg-absolute-black/5 text-absolute-black/50 border-absolute-black/20 hover:bg-absolute-black/10'
                }`}
              >
                {(isEp ? epSearchMode : searchMode) === 'pid' ? 'ID' : 'Nome'}
              </button>
            )}
            <input
              type="text"
              value={activeInput}
              onChange={e => setActiveInput(e.target.value)}
              placeholder={
                isMh ? 'Pesquisar Matterhorn...'
                : isEp && epSearchMode === 'pid' ? 'Colar URL ou ID do produto Eprolo...'
                : isEp ? 'Filtrar por nome (na página)...'
                : searchMode === 'pid' ? 'Colar PID CJ...'
                : 'Pesquisar por nome...'
              }
              className="bg-transparent px-3 py-1.5 font-mono text-xs tracking-widest uppercase placeholder:text-absolute-black/40 outline-none w-64"
            />
            {isMh && mhSearchInput && (
              <button type="button" onClick={() => { setMhSearch(''); setMhSearchInput(''); setMhPage(1); }} className="px-2 text-absolute-black/40 hover:text-red-500 transition-colors font-mono text-[13px]">✕</button>
            )}
            {isEp && epSearchInput && (
              <button type="button" onClick={() => { setEpSearch(''); setEpSearchInput(''); setEpPage(1); }} className="px-2 text-absolute-black/40 hover:text-red-500 transition-colors font-mono text-[13px]">✕</button>
            )}
            <SfButton type="submit" size="sm" className="!rounded-none !bg-absolute-black !text-stark-white font-mono text-[11px] tracking-widest uppercase !px-4 shrink-0">↵</SfButton>
          </form>

          {isEp && epSearchMode === 'pid' && (
            <span className="font-mono text-[11px] text-solar-yellow bg-solar-yellow/10 border border-solar-yellow/30 px-2 py-1 tracking-widest">
              MODO ID
            </span>
          )}
          {!isMh && !isEp && searchMode === 'pid' && (
            <span className="font-mono text-[11px] text-solar-yellow bg-solar-yellow/10 border border-solar-yellow/30 px-2 py-1 tracking-widest">
              MODO PID
            </span>
          )}
          {isMh && (
            <button
              onClick={() => { setMhNewOnly((v: boolean) => !v); setMhPage(1); }}
              className={`font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                mhNewOnly ? 'bg-absolute-black text-stark-white border-absolute-black' : 'border-absolute-black/15 text-absolute-black/70 hover:border-absolute-black/50'
              }`}
            >
              Novidades
            </button>
          )}
          <span className="ml-auto font-mono text-[13px] text-absolute-black/90 tracking-widest">
            {isLoading ? '...' : `${currentTotal.toLocaleString()} produtos`}
          </span>
        </div>

        {!isMh && !isEp && searchMode === 'name' && (
          <div className="flex gap-2 flex-wrap">
            {CJ_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                  category === cat
                    ? 'bg-absolute-black text-stark-white border-absolute-black'
                    : 'border-absolute-black/15 text-absolute-black/70 hover:border-absolute-black/50 hover:text-absolute-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Eprolo — category pills (só no modo browse, não no modo ID) */}
        {isEp && epSearchMode === 'name' && epCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setEpWareTypeId('')}
              className={`font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                !epWareTypeId
                  ? 'bg-absolute-black text-stark-white border-absolute-black'
                  : 'border-absolute-black/15 text-absolute-black/70 hover:border-absolute-black/50 hover:text-absolute-black'
              }`}
            >
              Todas
            </button>
            {epCategories.map((cat: any) => {
              const id = String(cat.id || cat.wareTypeId || cat.type_id || '');
              const name = cat.name || cat.typeName || cat.type_name || id;
              return (
                <button
                  key={id}
                  onClick={() => setEpWareTypeId(epWareTypeId === id ? '' : id)}
                  className={`font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                    epWareTypeId === id
                      ? 'bg-solar-yellow text-absolute-black border-solar-yellow'
                      : 'border-absolute-black/15 text-absolute-black/70 hover:border-absolute-black/50 hover:text-absolute-black'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
        {isEp && epSearchMode === 'name' && epCategories.length === 0 && (
          <p className="font-mono text-[11px] text-absolute-black/40 tracking-widest">A carregar categorias...</p>
        )}
      </div>

      {/* Product grid */}
      <div className="px-8 md:px-12 py-10">
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="aspect-square bg-bleached-concrete/30" />
                <div className="h-2 bg-bleached-concrete/30 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentList.map((product: any) => {
              const pid = product.cjPid || product.matterhorn_id || product.eprolo_id || String(product.id);
              const isFeatured = featuredPids.includes(pid);
              const isSaving = saving === pid;
              const normalizedProduct = isMh
                ? { ...product, cjPid: pid, supplier: 'matterhorn' }
                : isEp
                ? { ...product, cjPid: pid, supplier: 'eprolo' }
                : product;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative flex flex-col gap-2"
                >
                  <div className="relative aspect-square overflow-hidden bg-bleached-concrete/20">
                    <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/40 transition-colors duration-300 flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFeatured(normalizedProduct); }}
                        disabled={isSaving}
                        className={`font-mono text-[13px] tracking-widest uppercase px-4 py-2 transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 ${isFeatured ? 'bg-red-500 text-stark-white hover:bg-red-600' : 'bg-solar-yellow text-absolute-black hover:bg-solar-yellow/90'} disabled:opacity-50`}
                      >
                        {isSaving ? '...' : isFeatured ? '− Remover' : '+ Adicionar'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDetails(normalizedProduct); }}
                        className="font-mono text-[14px] tracking-widest uppercase px-4 py-2 bg-stark-white text-absolute-black opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 hover:bg-bleached-concrete"
                      >
                        Ver Variantes
                      </button>
                    </div>
                    {isFeatured && (
                      <div className="absolute top-2 left-2 bg-solar-yellow text-absolute-black font-mono text-[13px] tracking-widest uppercase px-2 py-0.5">✓ Na loja</div>
                    )}
                  </div>
                  <p className="font-mono text-[14px] tracking-wider text-absolute-black/90 leading-tight line-clamp-2">{product.name}</p>
                  <p className="font-mono text-[14px] text-absolute-black/70">{product.price}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {(currentPage > 1 || canGoNext) && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => isMh ? setMhPage((p: number) => p - 1) : isEp ? setEpPage((p: number) => p - 1) : setPage((p: number) => p - 1)}
              className="font-mono text-[13px] tracking-widest uppercase px-4 py-2 border border-absolute-black/20 hover:border-absolute-black disabled:opacity-30 transition-colors"
            >
              ← Anterior
            </button>
            <span className="font-mono text-[13px] text-absolute-black/90">{currentPage}</span>
            <button
              disabled={!canGoNext}
              onClick={() => isMh ? setMhPage((p: number) => p + 1) : isEp ? setEpPage((p: number) => p + 1) : setPage((p: number) => p + 1)}
              className="font-mono text-[13px] tracking-widest uppercase px-4 py-2 border border-absolute-black/20 hover:border-absolute-black disabled:opacity-30 transition-colors"
            >
              Seguinte →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
