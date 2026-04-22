'use client';

import { motion } from 'motion/react';
import type { CJProduct } from '../hooks/useCJProducts';

interface Props {
  featuredProducts: CJProduct[];
  newCollectionName: string;
  setNewCollectionName: (s: string) => void;
  collectionFilter: string | null;
  setCollectionFilter: (s: string | null) => void;
  openDetails: (product: CJProduct) => void;
  setAdminTab: (tab: 'variants' | 'content') => void;
  onNavigateBrowse: () => void;
}

export default function AdminCollections({ featuredProducts, newCollectionName, setNewCollectionName, collectionFilter, setCollectionFilter, openDetails, setAdminTab, onNavigateBrowse }: Props) {
  const allCollections = Array.from(new Set(featuredProducts.map(p => p.collection).filter(Boolean))) as string[];
  const uncategorized = featuredProducts.filter(p => !p.collection);

  return (
    <motion.div
      key="collections"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-8 md:px-12 py-10"
    >
      <div className="flex flex-col gap-10">
        <div className="flex items-start justify-between gap-8 flex-wrap">
          <div>
            <h2 className="font-serif italic text-2xl font-light mb-1">Coleções</h2>
            <p className="font-mono text-[13px] text-absolute-black/40 tracking-widest">Agrupa os teus produtos em coleções para organizar a loja.</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (newCollectionName.trim()) { setCollectionFilter(newCollectionName.trim()); setNewCollectionName(''); } }}
            className="flex gap-3 items-end"
          >
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/40">Nova Coleção</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Ex: Verão 2025"
                className="bg-transparent border-b border-absolute-black/20 px-3 py-2 font-mono text-sm focus:border-absolute-black outline-none transition-colors w-52"
              />
            </div>
            <button type="submit" className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 bg-absolute-black text-stark-white hover:bg-absolute-black/80 transition-colors min-h-[44px]">Criar</button>
          </form>
        </div>

        <div className="flex flex-col gap-8">
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCollectionFilter(null)}
              className={`font-mono text-[13px] uppercase tracking-widest px-4 py-2 border transition-colors ${collectionFilter === null ? 'bg-absolute-black text-stark-white border-absolute-black' : 'border-absolute-black/20 text-absolute-black/60 hover:border-absolute-black/60'}`}
            >
              Todas
            </button>
            {allCollections.map(col => (
              <button
                key={col}
                onClick={() => setCollectionFilter(collectionFilter === col ? null : col)}
                className={`font-mono text-[13px] uppercase tracking-widest px-4 py-2 border transition-colors ${collectionFilter === col ? 'bg-absolute-black text-stark-white border-absolute-black' : 'border-absolute-black/20 text-absolute-black/60 hover:border-absolute-black/60'}`}
              >
                {col} ({featuredProducts.filter(p => p.collection === col).length})
              </button>
            ))}
            {uncategorized.length > 0 && (
              <button
                onClick={() => setCollectionFilter('__none__')}
                className={`font-mono text-[13px] uppercase tracking-widest px-4 py-2 border transition-colors ${collectionFilter === '__none__' ? 'bg-absolute-black text-stark-white border-absolute-black' : 'border-absolute-black/20 text-absolute-black/40 hover:border-absolute-black/40'}`}
              >
                Sem coleção ({uncategorized.length})
              </button>
            )}
          </div>

          {featuredProducts.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <p className="font-serif italic text-3xl text-absolute-black/30 font-light">Loja vazia</p>
              <button onClick={onNavigateBrowse} className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors">Adicionar produtos →</button>
            </div>
          ) : collectionFilter === null ? (
            <div className="flex flex-col gap-12">
              {allCollections.map(col => (
                <div key={col}>
                  <div className="flex items-center gap-4 mb-5">
                    <h3 className="font-serif italic text-xl font-light">{col}</h3>
                    <div className="flex-1 h-[0.5px] bg-absolute-black/10" />
                    <span className="font-mono text-[13px] text-absolute-black/40 tracking-widest">{featuredProducts.filter(p => p.collection === col).length} produto{featuredProducts.filter(p => p.collection === col).length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {featuredProducts.filter(p => p.collection === col).map(product => (
                      <div key={product.id} className="flex flex-col gap-2 group">
                        <button onClick={() => openDetails(product)} className="relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20">
                          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/30 transition-colors flex items-center justify-center">
                            <span className="font-mono text-[13px] uppercase tracking-widest text-stark-white opacity-0 group-hover:opacity-100 transition-opacity">Editar</span>
                          </div>
                        </button>
                        <p className="font-mono text-[13px] tracking-wider text-absolute-black/80 line-clamp-1">{product.name}</p>
                        <p className="font-mono text-[13px] text-absolute-black/50">{product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {uncategorized.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <h3 className="font-serif italic text-xl font-light text-absolute-black/40">Sem coleção</h3>
                    <div className="flex-1 h-[0.5px] bg-absolute-black/10" />
                    <span className="font-mono text-[13px] text-absolute-black/30 tracking-widest">{uncategorized.length}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {uncategorized.map(product => (
                      <div key={product.id} className="flex flex-col gap-2 group">
                        <button onClick={() => { openDetails(product); setAdminTab('content'); }} className="relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20">
                          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/20 transition-colors flex items-center justify-center">
                            <span className="font-mono text-[13px] uppercase tracking-widest text-absolute-black opacity-0 group-hover:opacity-100 transition-opacity">Atribuir</span>
                          </div>
                        </button>
                        <p className="font-mono text-[13px] tracking-wider text-absolute-black/60 line-clamp-1">{product.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="font-serif italic text-xl font-light">{collectionFilter === '__none__' ? 'Sem coleção' : collectionFilter}</h3>
                <div className="flex-1 h-[0.5px] bg-absolute-black/10" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {featuredProducts
                  .filter(p => collectionFilter === '__none__' ? !p.collection : p.collection === collectionFilter)
                  .map(product => (
                    <div key={product.id} className="flex flex-col gap-2 group">
                      <button onClick={() => { openDetails(product); setAdminTab('content'); }} className="relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20">
                        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/30 transition-colors flex items-center justify-center">
                          <span className="font-mono text-[13px] uppercase tracking-widest text-stark-white opacity-0 group-hover:opacity-100 transition-opacity">Editar</span>
                        </div>
                      </button>
                      <p className="font-mono text-[13px] tracking-wider text-absolute-black/80 line-clamp-1">{product.name}</p>
                      <p className="font-mono text-[13px] text-absolute-black/50">{product.price}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
