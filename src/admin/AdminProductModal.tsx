'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { CJProduct } from '../hooks/useCJProducts';
import { parseVariantName } from './adminUtils';

interface Props {
  viewingProduct: any | null;
  productDetail: any | null;
  detailLoading: boolean;
  shippingMethods: any[];
  shippingLoading: boolean;
  selectedVids: string[];
  setSelectedVids: React.Dispatch<React.SetStateAction<string[]>>;
  customName: string;
  setCustomName: (s: string) => void;
  customDesc: string;
  setCustomDesc: (s: string) => void;
  customImage: string;
  setCustomImage: (s: string) => void;
  customPrice: string;
  setCustomPrice: (s: string) => void;
  customCollection: string;
  setCustomCollection: (s: string) => void;
  customShipping: string;
  setCustomShipping: (s: string) => void;
  customVariantNames: Record<string, string>;
  setCustomVariantNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  editingVid: string | null;
  setEditingVid: (vid: string | null) => void;
  uploading: boolean;
  previewImage: string;
  setPreviewImage: (s: string) => void;
  previewColor: string | null;
  setPreviewColor: (c: string | null) => void;
  excludedImages: string[];
  setExcludedImages: React.Dispatch<React.SetStateAction<string[]>>;
  customExtraImages: string[];
  globalSettings: Record<string, string | null>;
  mhShippingMethods: any[];
  featuredPids: string[];
  featuredProducts: CJProduct[];
  saving: string | null;
  saveError: string | null;
  closeModal: () => void;
  toggleVid: (vid: string) => void;
  toggleFeatured: (product: CJProduct, vids?: string[]) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setTab: (tab: 'dashboard' | 'browse' | 'store' | 'collections' | 'orders') => void;
}

export default function AdminProductModal({
  viewingProduct, productDetail, detailLoading, shippingMethods, shippingLoading,
  selectedVids, setSelectedVids, customName, setCustomName, customDesc, setCustomDesc,
  customImage, setCustomImage, customPrice, setCustomPrice, customCollection, setCustomCollection,
  customShipping, setCustomShipping, customVariantNames, setCustomVariantNames,
  editingVid, setEditingVid, uploading, previewImage, setPreviewImage, previewColor, setPreviewColor,
  excludedImages, setExcludedImages, customExtraImages,
  globalSettings, mhShippingMethods, featuredPids, featuredProducts,
  saving, saveError, closeModal, toggleVid, toggleFeatured, handleUpload, setTab,
}: Props) {
  if (!viewingProduct) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-absolute-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-raw-linen w-full max-w-5xl h-[92vh] sm:h-[88vh] overflow-hidden flex flex-col shadow-2xl"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center font-mono text-[13px] text-absolute-black/40 hover:text-absolute-black hover:rotate-90 transition-all border border-absolute-black/15 hover:border-absolute-black bg-raw-linen/90 backdrop-blur-sm"
          >
            ✕
          </button>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

            {/* LEFT: Gallery */}
            <div className="lg:w-[40%] flex flex-row gap-2 p-4 border-b lg:border-b-0 lg:border-r border-absolute-black/8 bg-bleached-concrete/10 overflow-hidden">
              <div className="hidden lg:flex flex-col gap-1.5 overflow-y-auto w-[60px] shrink-0 pr-0.5">
                {detailLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-[52px] aspect-square bg-absolute-black/5 animate-pulse shrink-0" />
                  ))
                ) : (
                  (productDetail?.images?.length ? productDetail.images : [viewingProduct.image]).map((img: string, i: number) => {
                    const current = previewImage || viewingProduct.image;
                    const isExcluded = excludedImages.includes(img);
                    return (
                      <div key={i} className="relative group/thumb shrink-0">
                        <button
                          onClick={() => !isExcluded && setPreviewImage(img)}
                          className={`w-[52px] aspect-square border-2 transition-all overflow-hidden block ${
                            isExcluded
                              ? 'border-red-300 opacity-25 cursor-default'
                              : current === img
                                ? 'border-absolute-black'
                                : 'border-transparent opacity-40 hover:opacity-75 hover:border-absolute-black/30'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                        <button
                          onClick={() => {
                            if (isExcluded) {
                              setExcludedImages(prev => prev.filter(u => u !== img));
                            } else {
                              setExcludedImages(prev => [...prev, img]);
                              if ((previewImage || viewingProduct.image) === img) {
                                const allImgs = productDetail?.images?.length ? productDetail.images : [viewingProduct.image];
                                const next = allImgs.find((u: string) => u !== img && !excludedImages.includes(u));
                                if (next) setPreviewImage(next);
                              }
                            }
                          }}
                          title={isExcluded ? 'Restaurar imagem' : 'Remover da galeria'}
                          className={`absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center font-mono text-[9px] leading-none transition-all ${
                            isExcluded
                              ? 'bg-green-500 text-stark-white opacity-80 hover:opacity-100'
                              : 'bg-red-500 text-stark-white opacity-0 group-hover/thumb:opacity-90 hover:!opacity-100'
                          }`}
                        >
                          {isExcluded ? '↺' : '×'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex-1 relative overflow-hidden bg-bleached-concrete/20 min-h-[260px] lg:min-h-0">
                {detailLoading ? (
                  <div className="absolute inset-0 animate-pulse bg-absolute-black/5" />
                ) : (
                  <img
                    src={previewImage || viewingProduct.image}
                    alt={viewingProduct.name}
                    className="w-full h-full object-cover object-center transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                )}
                {featuredPids.includes(viewingProduct.cjPid) && (
                  <div className="absolute top-3 left-3 bg-solar-yellow text-absolute-black font-mono text-[10px] tracking-[0.3em] uppercase px-2 py-1">
                    Na Loja
                  </div>
                )}
                <div className="lg:hidden absolute bottom-2 left-2 right-2 flex gap-1.5 overflow-x-auto">
                  {(productDetail?.images || [viewingProduct.image]).slice(0, 10).map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setPreviewImage(img)}
                      className={`w-9 h-9 shrink-0 border-2 overflow-hidden transition-all ${(previewImage || viewingProduct.image) === img ? 'border-stark-white' : 'border-transparent opacity-50'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Details */}
            <div className="lg:w-[60%] overflow-y-auto">
              <div className="p-6 space-y-5 pb-4">

                {/* Name */}
                <div className="group flex items-start gap-2 pr-10">
                  {editingVid === '__name__' ? (
                    <input
                      autoFocus
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      onBlur={() => setEditingVid(null)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingVid(null); }}
                      className="flex-1 font-serif text-xl font-light bg-transparent border-b-2 border-solar-yellow outline-none pb-1 leading-snug"
                      placeholder={viewingProduct.name}
                    />
                  ) : (
                    <>
                      <h3 className="font-serif text-xl font-light leading-snug flex-1">
                        {customName || viewingProduct.name}
                      </h3>
                      <button
                        onClick={() => setEditingVid('__name__')}
                        title="Editar nome"
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 mt-0.5 shrink-0 font-mono text-[11px] px-2 py-1 border border-absolute-black/20 transition-opacity"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-absolute-black/40 bg-absolute-black/5 px-2 py-1">
                    PID: {viewingProduct.cjPid}
                  </span>
                  {productDetail?.supplier && (
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-absolute-black/40 bg-absolute-black/5 px-2 py-1">
                      {productDetail.supplier}
                    </span>
                  )}
                  {(productDetail?.weight ?? 0) > 0 && (
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-absolute-black/40 bg-absolute-black/5 px-2 py-1">
                      {productDetail.weight}kg
                    </span>
                  )}
                  {productDetail?.processingTime && (
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-absolute-black/40 bg-absolute-black/5 px-2 py-1">
                      Process. {productDetail.processingTime}d
                    </span>
                  )}
                  {(productDetail?.moq ?? 0) > 1 && (
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-solar-yellow border border-solar-yellow/40 px-2 py-1">
                      MOQ {productDetail.moq}un
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2 pt-4 border-t border-absolute-black/8">
                  {(() => {
                    const cjPrice = productDetail?.priceNum ?? viewingProduct.priceNum ?? 0;
                    const selectedShipping = shippingMethods.find(m => m.id === customShipping);
                    const shippingCost = selectedShipping ? selectedShipping.price : null;
                    const totalCost = shippingCost != null ? cjPrice + shippingCost : null;
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Custo CJ</span>
                          <span className="font-mono text-base text-absolute-black/50">
                            {cjPrice > 0 ? `€${cjPrice.toFixed(2)}` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Custo Envio</span>
                          <span className="font-mono text-base text-absolute-black/50">
                            {shippingLoading ? (
                              <span className="animate-pulse">...</span>
                            ) : shippingCost === null ? (
                              <span className="text-absolute-black/20">—</span>
                            ) : shippingCost === 0 ? (
                              <span className="text-green-600">Grátis</span>
                            ) : (
                              `€${shippingCost.toFixed(2)}`
                            )}
                          </span>
                        </div>
                        {totalCost != null && (
                          <div className="flex items-center justify-between pt-1 border-t border-absolute-black/8">
                            <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/60 font-semibold">Total Custo</span>
                            <span className="font-mono text-base text-absolute-black/70 font-semibold">€{totalCost.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Preço Loja</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xl text-absolute-black/40">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customPrice}
                        onChange={e => setCustomPrice(e.target.value)}
                        placeholder={viewingProduct.priceNum != null ? String(viewingProduct.priceNum) : '0.00'}
                        className="bg-transparent border-b-2 border-absolute-black/15 focus:border-solar-yellow outline-none font-mono text-xl text-absolute-black w-28 text-right pb-0.5 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors */}
                {!detailLoading && (productDetail?.colors?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-absolute-black/8">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Cor</span>
                      {previewColor && (
                        <span className="font-mono text-[12px] tracking-widest uppercase text-absolute-black">
                          {previewColor}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(productDetail.colors as string[]).map((color: string) => {
                        const colorVariant = productDetail.variants.find(
                          (v: any) => parseVariantName(v.variantNameEn || v.name).color === color
                        );
                        const colorImg = colorVariant?.variantImage || colorVariant?.image;
                        const isActive = previewColor === color;
                        const activeCount = productDetail.variants.filter(
                          (v: any) => parseVariantName(v.variantNameEn || v.name).color === color && selectedVids.includes(v.vid)
                        ).length;
                        const totalCount = productDetail.variants.filter(
                          (v: any) => parseVariantName(v.variantNameEn || v.name).color === color
                        ).length;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              const next = isActive ? null : color;
                              setPreviewColor(next);
                              if (!isActive && colorImg) setPreviewImage(colorImg);
                            }}
                            className={`relative w-[52px] h-[52px] border-2 overflow-hidden transition-all ${
                              isActive ? 'border-absolute-black scale-105' : 'border-transparent opacity-55 hover:opacity-90 hover:border-absolute-black/30'
                            }`}
                            title={color}
                          >
                            {colorImg ? (
                              <img src={colorImg} alt={color} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-absolute-black/8 font-mono text-[9px] text-absolute-black/60 text-center px-1 leading-tight">
                                {color}
                              </div>
                            )}
                            <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${activeCount > 0 ? 'bg-solar-yellow' : 'bg-absolute-black/10'}`} />
                            <div className="absolute top-0.5 right-0.5 bg-raw-linen/90 font-mono text-[8px] px-0.5 leading-none py-0.5">
                              {activeCount}/{totalCount}
                            </div>
                          </button>
                        );
                      })}
                      {previewColor && (
                        <button
                          onClick={() => setPreviewColor(null)}
                          className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/35 hover:text-absolute-black transition-colors self-center ml-1 underline"
                        >
                          Todas
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Variants */}
                {detailLoading ? (
                  <div className="flex flex-col gap-3 pt-4 border-t border-absolute-black/8 animate-pulse">
                    <div className="h-3 w-16 bg-absolute-black/8" />
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 w-14 bg-absolute-black/8" />)}
                    </div>
                  </div>
                ) : (productDetail?.variants?.length ?? 0) > 0 ? (
                  <div className="flex flex-col gap-3 pt-4 border-t border-absolute-black/8">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">
                        {(productDetail.colors?.length ?? 0) > 0 ? 'Tamanho' : 'Variantes'}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const vids = (previewColor
                              ? productDetail.variants.filter((v: any) => parseVariantName(v.variantNameEn || v.name).color === previewColor)
                              : productDetail.variants
                            ).map((v: any) => v.vid);
                            setSelectedVids(prev => [...new Set([...prev, ...vids])]);
                          }}
                          className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/35 hover:text-absolute-black underline transition-colors"
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => {
                            if (previewColor) {
                              const colorVids = productDetail.variants
                                .filter((v: any) => parseVariantName(v.variantNameEn || v.name).color === previewColor)
                                .map((v: any) => v.vid);
                              setSelectedVids(prev => prev.filter(id => !colorVids.includes(id)));
                            } else {
                              setSelectedVids([]);
                            }
                          }}
                          className="font-mono text-[11px] uppercase tracking-widest text-absolute-black/35 hover:text-absolute-black underline transition-colors"
                        >
                          Nenhum
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(previewColor
                        ? productDetail.variants.filter((v: any) => parseVariantName(v.variantNameEn || v.name).color === previewColor)
                        : productDetail.variants
                      ).map((v: any) => {
                        const isActive = selectedVids.includes(v.vid);
                        const parsed = parseVariantName(v.variantNameEn || v.name);
                        const label = customVariantNames[v.vid] || parsed.size || parsed.full;
                        const stock = v.variantStock ?? v.stock ?? 0;
                        const price = v.variantSellPrice ?? v.sellPrice ?? v.price ?? 0;
                        return (
                          <div key={v.vid} className="flex flex-col items-center gap-0.5 group/size">
                            <button
                              onClick={() => toggleVid(v.vid)}
                              title={`€${parseFloat(price).toFixed(2)}${v.sku ? ` · SKU: ${v.sku}` : ''}`}
                              className={`relative font-mono text-[12px] tracking-widest uppercase px-4 py-2.5 border-2 transition-all min-w-[52px] text-center ${
                                isActive
                                  ? 'border-absolute-black bg-absolute-black text-stark-white'
                                  : 'border-absolute-black/15 text-absolute-black/50 hover:border-absolute-black/50 hover:text-absolute-black'
                              }`}
                            >
                              {label}
                              {stock > 0 && stock <= 5 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-raw-linen" />
                              )}
                            </button>
                            {editingVid === v.vid ? (
                              <input
                                autoFocus
                                type="text"
                                value={customVariantNames[v.vid] ?? label}
                                onChange={e => setCustomVariantNames(prev => ({ ...prev, [v.vid]: e.target.value }))}
                                onBlur={() => setEditingVid(null)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingVid(null); e.stopPropagation(); }}
                                onClick={e => e.stopPropagation()}
                                className="w-full font-mono text-[10px] bg-stark-white border border-solar-yellow px-1 py-0.5 outline-none text-center"
                              />
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); setEditingVid(v.vid); }}
                                className="font-mono text-[9px] text-absolute-black/25 hover:text-absolute-black/60 opacity-0 group-hover/size:opacity-100 transition-all"
                              >
                                ✎ renomear
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedVids.length === 0 && productDetail.variants.length > 0 && (
                      <p className="font-mono text-[11px] text-amber-600 tracking-widest">
                        Nenhuma selecionada — todas as variantes serão exibidas
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Collection */}
                <div className="flex flex-col gap-2 pt-4 border-t border-absolute-black/8">
                  <label className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Coleção</label>
                  <div className="flex gap-2 flex-wrap">
                    {(Array.from(new Set(featuredProducts.map(p => p.collection).filter(Boolean))) as string[]).map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setCustomCollection(customCollection === col ? '' : col)}
                        className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                          customCollection === col
                            ? 'bg-absolute-black text-stark-white border-absolute-black'
                            : 'border-absolute-black/15 text-absolute-black/45 hover:border-absolute-black/50 hover:text-absolute-black'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customCollection}
                    onChange={e => setCustomCollection(e.target.value)}
                    placeholder="Ex: Verão 2025, Resort, Essentials..."
                    className="bg-transparent border-b border-absolute-black/15 focus:border-absolute-black outline-none font-mono text-sm py-2 transition-colors placeholder:text-absolute-black/25"
                  />
                </div>

                {/* Shipping */}
                {(viewingProduct as any)?.supplier === 'matterhorn' ? (
                  <div className="flex flex-col gap-2 pt-4 border-t border-absolute-black/8">
                    <label className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Matterhorn · Envio</label>
                    <p className="font-mono text-[11px] text-absolute-black/50 tracking-widest leading-relaxed">
                      Envio Matterhorn é por encomenda. Configura o método global em{' '}
                      <button type="button" onClick={() => setTab('store')} className="underline hover:text-absolute-black transition-colors">A Minha Loja</button>.
                    </p>
                    <p className="font-mono text-[11px] tracking-widest">
                      {globalSettings.matterhorn_shipping_method
                        ? <span className="text-green-700">✓ {mhShippingMethods.find(m => m.id === globalSettings.matterhorn_shipping_method)?.name || globalSettings.matterhorn_shipping_method}</span>
                        : <span className="text-absolute-black/30">Automático (Matterhorn decide)</span>}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 pt-4 border-t border-absolute-black/8">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">
                        {(viewingProduct as any)?.supplier === 'eprolo' ? 'Eprolo · Métodos de Envio' : 'CJ · Envio → Portugal'}
                      </label>
                      {shippingLoading && <span className="font-mono text-[11px] text-absolute-black/25 animate-pulse">A carregar...</span>}
                    </div>
                    {!shippingLoading && shippingMethods.length === 0 && (
                      <p className="font-mono text-[11px] text-absolute-black/25 tracking-widest">
                        {(viewingProduct as any)?.supplier === 'eprolo' ? 'Sem métodos de envio Eprolo disponíveis.' : 'Sem métodos de envio CJ disponíveis.'}
                      </p>
                    )}
                    {shippingMethods.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCustomShipping('')}
                          className={`flex items-center gap-3 px-4 py-3 border-2 text-left transition-all ${customShipping === '' ? 'border-absolute-black bg-absolute-black/3' : 'border-absolute-black/10 hover:border-absolute-black/25'}`}
                        >
                          <div className="flex-1">
                            <p className="font-mono text-[12px] uppercase tracking-widest text-absolute-black">
                              {(viewingProduct as any)?.supplier === 'eprolo' ? 'Automático (Eprolo decide)' : 'Automático (CJ decide)'}
                            </p>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${customShipping === '' ? 'border-absolute-black bg-absolute-black' : 'border-absolute-black/25'}`}>
                            {customShipping === '' && <span className="w-1.5 h-1.5 rounded-full bg-stark-white block" />}
                          </div>
                        </button>
                        {shippingMethods.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setCustomShipping(m.id)}
                            className={`flex items-center gap-3 px-4 py-3 border-2 text-left transition-all ${customShipping === m.id ? 'border-absolute-black bg-absolute-black/3' : 'border-absolute-black/10 hover:border-absolute-black/25'}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[12px] uppercase tracking-widest text-absolute-black truncate">{m.name}</p>
                              <p className="font-mono text-[11px] text-absolute-black/40 mt-0.5">
                                {m.estimatedDelivery}
                                {m.price === 0
                                  ? <span className="text-green-600 ml-2">· Grátis</span>
                                  : <span className="ml-2">· {m.priceFormatted}</span>}
                                {m.tracking && <span className="ml-2 text-absolute-black/25">· Rastreio</span>}
                              </p>
                            </div>
                            <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${customShipping === m.id ? 'border-absolute-black bg-absolute-black' : 'border-absolute-black/25'}`}>
                              {customShipping === m.id && <span className="w-1.5 h-1.5 rounded-full bg-stark-white block" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Image picker */}
                <div className="flex flex-col gap-2 pt-4 border-t border-absolute-black/8">
                  <label className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Imagem Principal (Capa)</label>
                  <div className="flex gap-2 flex-wrap">
                    <label className={`w-12 h-12 border-2 border-dashed border-absolute-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-solar-yellow transition-all shrink-0 ${uploading ? 'opacity-40 pointer-events-none' : ''}`}>
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                      <span className="text-base leading-none">+</span>
                      <span className="font-mono text-[8px] uppercase">{uploading ? '...' : 'Upload'}</span>
                    </label>
                    {(() => {
                      const base: string[] = productDetail?.images?.length ? productDetail.images : [viewingProduct.image];
                      const extras = customExtraImages.filter(u => !base.includes(u));
                      const all = extras.length > 0 ? [...extras, ...base] : base;
                      const sel = customImage || viewingProduct.image;
                      return all.map((img: string, i: number) => {
                        const isExcluded = excludedImages.includes(img);
                        return (
                          <div key={i} className="relative group/pick shrink-0">
                            <button
                              onClick={() => { if (!isExcluded) { setCustomImage(img); setPreviewImage(img); } }}
                              className={`relative w-12 h-12 border-2 overflow-hidden transition-all block ${
                                isExcluded
                                  ? 'border-red-300 opacity-20 cursor-default'
                                  : sel === img
                                    ? 'border-absolute-black'
                                    : 'border-transparent opacity-35 hover:opacity-70'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {sel === img && !isExcluded && (
                                <div className="absolute bottom-0 left-0 right-0 bg-solar-yellow font-mono text-[7px] text-center text-absolute-black py-0.5">CAPA</div>
                              )}
                              {isExcluded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="font-mono text-[9px] text-red-500 bg-raw-linen/80 px-1">excluída</span>
                                </div>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (isExcluded) {
                                  setExcludedImages(prev => prev.filter(u => u !== img));
                                } else {
                                  setExcludedImages(prev => [...prev, img]);
                                  if (sel === img) {
                                    const next = all.find((u: string) => u !== img && !excludedImages.includes(u));
                                    if (next) { setCustomImage(next); setPreviewImage(next); }
                                  }
                                }
                              }}
                              title={isExcluded ? 'Restaurar' : 'Remover da galeria'}
                              className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center font-mono text-[9px] leading-none border transition-all z-10 ${
                                isExcluded
                                  ? 'bg-green-500 border-green-600 text-stark-white opacity-80 hover:opacity-100'
                                  : 'bg-raw-linen border-red-300 text-red-500 opacity-0 group-hover/pick:opacity-100 hover:!opacity-100 hover:bg-red-500 hover:text-stark-white'
                              }`}
                            >
                              {isExcluded ? '↺' : '×'}
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 pt-4 border-t border-absolute-black/8">
                  <label className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Descrição</label>
                  <textarea
                    rows={5}
                    value={customDesc}
                    onChange={e => setCustomDesc(e.target.value)}
                    placeholder="Descrição para a loja — selling points, luxo, lifestyle..."
                    className="bg-transparent border border-absolute-black/10 p-3 font-mono text-[12px] leading-relaxed focus:border-absolute-black outline-none resize-none transition-colors placeholder:text-absolute-black/20"
                  />
                </div>

                <div className="h-2" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-absolute-black/10 px-6 py-4 flex items-center justify-between gap-4 bg-raw-linen flex-wrap">
            <div className="flex flex-col gap-0.5">
              {saveError ? (
                <p className="font-mono text-[12px] text-red-600 tracking-widest">
                  Erro: {saveError}
                </p>
              ) : (
                <>
                  <p className="font-mono text-[13px] text-absolute-black/60">
                    <strong className="text-absolute-black">{selectedVids.length}</strong>
                    {(productDetail?.variants?.length ?? 0) > 0 && <span className="text-absolute-black/35"> / {productDetail.variants.length}</span>}
                    {' '}variantes ativas
                  </p>
                  <p className="font-mono text-[11px] text-absolute-black/30 tracking-widest">
                    {customShipping
                      ? `Envio: ${shippingMethods.find(m => m.id === customShipping)?.name || customShipping}`
                      : `Envio: automático (${(viewingProduct as any)?.supplier === 'matterhorn' ? 'Matterhorn' : (viewingProduct as any)?.supplier === 'eprolo' ? 'Eprolo' : 'CJ'})`}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="font-mono text-[13px] uppercase tracking-widest px-6 py-3 border border-absolute-black/15 hover:border-absolute-black hover:bg-absolute-black hover:text-stark-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => toggleFeatured(viewingProduct, selectedVids)}
                disabled={saving === viewingProduct.cjPid}
                className="font-mono text-[13px] uppercase tracking-[0.2em] px-8 py-3 bg-absolute-black text-stark-white hover:bg-solar-yellow hover:text-absolute-black transition-all disabled:opacity-50"
              >
                {saving === viewingProduct.cjPid
                  ? '...'
                  : featuredPids.includes(viewingProduct.cjPid)
                    ? 'Guardar →'
                    : 'Adicionar à Loja →'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
