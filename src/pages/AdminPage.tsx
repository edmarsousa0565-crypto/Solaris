'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SfButton } from '@storefront-ui/react';
import { useCJProducts, type CJProduct } from '../hooks/useCJProducts';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;
const CJ_CATEGORIES = ['All', 'Shirt', 'Dress', 'Pants', 'Coat', 'Jacket', 'Accessories', 'Shoes', 'Bags', 'Swimwear'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'pid'>('name');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const [featuredPids, setFeaturedPids] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<CJProduct[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [tab, setTab] = useState<'browse' | 'store' | 'collections' | 'orders'>('browse');

  // Encomendas
  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [kvError, setKvError] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  
  // Estado para visualização de detalhes/variantes
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [productDetail, setProductDetail] = useState<any | null>(null);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedVids, setSelectedVids] = useState<string[]>([]);
  const [adminTab, setAdminTab] = useState<'variants' | 'content'>('variants');
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customImage, setCustomImage] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCollection, setCustomCollection] = useState('');
  const [customShipping, setCustomShipping] = useState('');
  const [customVariantNames, setCustomVariantNames] = useState<Record<string, string>>({});
  const [editingVid, setEditingVid] = useState<string | null>(null);
  const [variantFilter, setVariantFilter] = useState<'all' | string>('all');
  const [uploading, setUploading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [excludedImages, setExcludedImages] = useState<string[]>([]);

  const query = category === 'All' ? search : `${category} ${search}`.trim();
  const { products, total, loading } = useCJProducts({ query, page, pageSize: 24, searchMode });

  // Carrega produtos em destaque ao autenticar
  const loadFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/featured');
      const data = await res.json();
      if (data.error && data.error.includes('SUPABASE')) { setKvError(true); return; }
      setFeaturedPids(data.pids || []);
      setFeaturedProducts(data.products || []);
    } catch {
      setKvError(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadFeatured();
  }, [authed, loadFeatured]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders || []);
      setMetrics(data.metrics || null);
    } catch {
      /* silent */
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed && tab === 'orders') loadOrders();
  }, [authed, tab, loadOrders]);

  // Reordena produtos (troca sort_order com o vizinho)
  const reorderProduct = async (pid: string, direction: 'up' | 'down') => {
    const sorted = [...featuredProducts].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex(p => p.cjPid === pid);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const items = sorted.map((p, i) => ({ pid: p.cjPid, sortOrder: i }));
    const tmp = items[idx].sortOrder;
    items[idx].sortOrder = items[swapIdx].sortOrder;
    items[swapIdx].sortOrder = tmp;
    setReordering(true);
    try {
      await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, action: 'reorder', items }),
      });
      await loadFeatured();
    } finally {
      setReordering(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1200);
    }
  };

  const toggleFeatured = async (product: CJProduct, vids?: string[]) => {
    const pid = product.cjPid;
    const action = featuredPids.includes(pid) && !vids ? 'remove' : 'add';
    setSaving(pid);
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pid,
          action,
          vids,
          metadata: {
            name: customName || product.name,
            description: customDesc || undefined,
            image: customImage || product.image,
            price: customPrice ? parseFloat(customPrice) : undefined,
            collection: customCollection || undefined,
            shippingMethod: customShipping || undefined,
            variantNames: Object.keys(customVariantNames).length > 0 ? customVariantNames : undefined,
            excludedImages: excludedImages.length > 0 ? excludedImages : [],
          }
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (action === 'add') {
          await loadFeatured(); // Atualiza estado com dados reais guardados na DB
          if (vids !== undefined) closeModal();
        } else {
          setFeaturedPids(data.pids);
          setFeaturedProducts(prev => prev.filter(p => p.cjPid !== pid));
        }
      }
    } catch {
      /* silent */
    } finally {
      setSaving(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingProduct) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${viewingProduct.cjPid}-${Math.random()}.${fileExt}`;
      const filePath = `product-overrides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setCustomImage(data.publicUrl);
    } catch (err: any) {
      alert('Erro no upload: ' + (err.message || 'Verifique se o bucket "product-images" existe no Supabase.'));
    } finally {
      setUploading(false);
    }
  };

  const openDetails = async (product: CJProduct) => {
    setViewingProduct(product);
    setDetailLoading(true);
    setProductDetail(null);
    setSelectedVids([]);
    setAdminTab('variants');
    setVariantFilter('all');
    setPreviewImage(product.image || '');
    setPreviewColor(null);

    // Procura se já tem metadata
    const existing = featuredProducts.find(p => p.cjPid === product.cjPid);
    if (existing) {
      if (existing.selectedVids) setSelectedVids(existing.selectedVids);
      setCustomName(existing.name || '');
      setCustomDesc(existing.description || '');
      setCustomImage(existing.image || '');
      setCustomPrice(existing.priceNum != null ? String(existing.priceNum) : '');
      setCustomCollection(existing.collection || '');
      setCustomShipping((existing as any).shippingMethod || '');
      setCustomVariantNames((existing as any).variantNames || {});
      setExcludedImages((existing as any).excludedImages || []);
    } else {
      setCustomName('');
      setCustomDesc('');
      setCustomImage('');
      setCustomPrice('');
      setCustomCollection('');
      setCustomShipping('');
      setCustomVariantNames({});
    }

    setDetailLoading(true);
    setShippingMethods([]);
    setShippingLoading(true);
    try {
      const res = await fetch(`/api/cj/product?pid=${product.cjPid}&includeShipping=true&country=PT`);
      const data = await res.json();
      if (data.product) {
        setProductDetail(data.product);
        if (!existing?.selectedVids) {
          setSelectedVids(data.product.variants?.map((v: any) => v.vid) || []);
        }
      }
      setShippingMethods(data.shippingMethods || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
      setShippingLoading(false);
    }
  };

  const toggleVid = (vid: string) => {
    setSelectedVids(prev => 
      prev.includes(vid) ? prev.filter(v => v !== vid) : [...prev, vid]
    );
  };

  const closeModal = () => {
    setViewingProduct(null);
    setVariantFilter('all');
    setCustomName('');
    setCustomDesc('');
    setCustomImage('');
    setCustomPrice('');
    setCustomCollection('');
    setCustomShipping('');
    setCustomVariantNames({});
    setExcludedImages([]);
    setEditingVid(null);
    setShippingMethods([]);
    setPreviewImage('');
    setPreviewColor(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Parse variant name "Blue / XL" into parts
  const parseVariantName = (name: string) => {
    const parts = (name || '').split('/').map(p => p.trim()).filter(Boolean);
    return {
      color: parts.length > 1 ? parts[0] : null,
      size: parts.length > 1 ? parts[parts.length - 1] : parts[0] || '',
      full: name || '',
    };
  };

  // --- LOGIN ---
  if (!authed) {
    return (
      <div className="min-h-screen bg-deep-night flex items-center justify-center">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 items-center w-80"
        >
          <p className="font-mono text-[13px] tracking-[0.5em] uppercase text-stark-white/30">
            Solaris — Admin
          </p>
          <h1 className="font-serif text-4xl text-stark-white font-light italic">Acesso</h1>
          <div className="w-full">
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Palavra-passe"
              autoFocus
              className={`w-full bg-transparent border-b px-0 py-3 font-mono text-sm text-stark-white placeholder:text-stark-white/20 outline-none transition-colors ${
                pwError ? 'border-red-500' : 'border-stark-white/20 focus:border-solar-yellow'
              }`}
            />
            {pwError && (
              <p className="font-mono text-[13px] text-red-400 tracking-widest mt-2">Palavra-passe incorreta</p>
            )}
          </div>
          <SfButton
            type="submit"
            className="!rounded-none !bg-solar-yellow !text-absolute-black font-mono text-[13px] tracking-[0.3em] uppercase w-full !py-3"
          >
            Entrar →
          </SfButton>
        </motion.form>
      </div>
    );
  }

  // --- PAINEL ---
  return (
    <div className="min-h-screen bg-raw-linen text-absolute-black">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-deep-night text-stark-white border-b border-stark-white/10">
        <div className="flex items-center justify-between px-5 md:px-12 h-12">
          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/40 shrink-0">
            Solaris Admin
          </span>
          <Link to="/" className="font-mono text-[11px] tracking-widest uppercase text-stark-white/30 hover:text-stark-white transition-colors shrink-0">
            ← Voltar
          </Link>
        </div>
        <nav className="flex border-t border-stark-white/10 overflow-x-auto scrollbar-none">
          {([
            ['browse', 'Explorar Catalogo'],
            ['store', `A Minha Loja (${featuredPids.length})`],
            ['collections', 'Colecoes'],
            ['orders', orders.length > 0 ? `Encomendas (${orders.length})` : 'Encomendas'],
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 font-mono text-[11px] md:text-[13px] tracking-widest uppercase px-5 md:px-8 py-3 transition-colors border-b-2 ${
                tab === t
                  ? 'border-solar-yellow text-solar-yellow'
                  : 'border-transparent text-stark-white/40 hover:text-stark-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {kvError && (
        <div className="bg-red-50 border-b border-red-200 px-8 py-3">
          <p className="font-mono text-[13px] tracking-widest uppercase text-red-600">
            Supabase não configurado — crie um projeto Supabase e adicione SUPABASE_URL e SUPABASE_ANON_KEY ao ficheiro .env
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* TAB: EXPLORAR CATÁLOGO */}
        {tab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Barra de pesquisa */}
            <div className="sticky top-14 z-40 bg-raw-linen/95 backdrop-blur-sm border-b border-absolute-black/10 px-8 md:px-12 py-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch} className="flex gap-0 border border-absolute-black/20 focus-within:border-absolute-black transition-colors">
                  {/* Mode toggle */}
                  <button
                    type="button"
                    onClick={() => { setSearchMode(m => m === 'name' ? 'pid' : 'name'); setPage(1); }}
                    title={searchMode === 'pid' ? 'Modo PID — clica para voltar a pesquisa por nome' : 'Modo nome — clica para pesquisar por PID/SKU'}
                    className={`px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase border-r transition-colors shrink-0 ${
                      searchMode === 'pid'
                        ? 'bg-solar-yellow text-absolute-black border-solar-yellow/50'
                        : 'bg-absolute-black/5 text-absolute-black/50 border-absolute-black/20 hover:bg-absolute-black/10'
                    }`}
                  >
                    {searchMode === 'pid' ? 'PID' : 'Nome'}
                  </button>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder={searchMode === 'pid' ? 'Colar PID do produto...' : 'Pesquisar por nome...'}
                    className="bg-transparent px-3 py-1.5 font-mono text-xs tracking-widest uppercase placeholder:text-absolute-black/40 outline-none w-52"
                  />
                  <SfButton type="submit" size="sm" className="!rounded-none !bg-absolute-black !text-stark-white font-mono text-[11px] tracking-widest uppercase !px-4 shrink-0">
                    ↵
                  </SfButton>
                </form>
                {searchMode === 'pid' && (
                  <span className="font-mono text-[11px] text-solar-yellow bg-solar-yellow/10 border border-solar-yellow/30 px-2 py-1 tracking-widest">
                    MODO PID — cola o ID do produto CJ
                  </span>
                )}
                <span className="ml-auto font-mono text-[13px] text-absolute-black/90 tracking-widest">
                  {loading ? '...' : `${total.toLocaleString()} produtos`}
                </span>
              </div>
              {searchMode === 'name' && (
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
            </div>

            {/* Grelha de produtos */}
            <div className="px-8 md:px-12 py-10">
              {loading ? (
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
                  {products.map((product) => {
                    const isFeatured = featuredPids.includes(product.cjPid);
                    const isSaving = saving === product.cjPid;
                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative flex flex-col gap-2"
                      >
                        <div className="relative aspect-square overflow-hidden bg-bleached-concrete/20">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          {/* Overlay de ação */}
                          <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/40 transition-colors duration-300 flex flex-col items-center justify-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFeatured(product); }}
                              disabled={isSaving}
                              className={`font-mono text-[13px] tracking-widest uppercase px-4 py-2 transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 ${
                                isFeatured
                                  ? 'bg-red-500 text-stark-white hover:bg-red-600'
                                  : 'bg-solar-yellow text-absolute-black hover:bg-solar-yellow/90'
                              } disabled:opacity-50`}
                            >
                              {isSaving ? '...' : isFeatured ? '− Remover' : '+ Adicionar'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDetails(product); }}
                              className="font-mono text-[14px] tracking-widest uppercase px-4 py-2 bg-stark-white text-absolute-black opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 hover:bg-bleached-concrete"
                            >
                              Ver Variantes
                            </button>
                          </div>
                          {/* Badge se já está na loja */}
                          {isFeatured && (
                            <div className="absolute top-2 left-2 bg-solar-yellow text-absolute-black font-mono text-[13px] tracking-widest uppercase px-2 py-0.5">
                              ✓ Na loja
                            </div>
                          )}
                        </div>
                        <p className="font-mono text-[14px] tracking-wider text-absolute-black/90 leading-tight line-clamp-2">{product.name}</p>
                        <p className="font-mono text-[14px] text-absolute-black/70">{product.price}</p>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Paginação */}
              {total > 24 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="font-mono text-[13px] tracking-widest uppercase px-4 py-2 border border-absolute-black/20 hover:border-absolute-black disabled:opacity-30 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span className="font-mono text-[13px] text-absolute-black/90">{page}</span>
                  <button
                    disabled={page * 24 >= total}
                    onClick={() => setPage(p => p + 1)}
                    className="font-mono text-[13px] tracking-widest uppercase px-4 py-2 border border-absolute-black/20 hover:border-absolute-black disabled:opacity-30 transition-colors"
                  >
                    Seguinte →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB: A MINHA LOJA */}
        {tab === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-8 md:px-12 py-10"
          >
            {featuredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <p className="font-serif italic text-4xl text-absolute-black/70 font-light">Loja vazia</p>
                <p className="font-mono text-xs text-absolute-black/90 tracking-widest uppercase">
                  Vai ao "Explorar Catalogo" e adiciona produtos
                </p>
                <button
                  onClick={() => setTab('browse')}
                  className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors mt-2"
                >
                  Explorar agora →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif italic text-2xl font-light">
                    {featuredProducts.length} produto{featuredProducts.length !== 1 ? 's' : ''} na loja
                  </h2>
                  <Link
                    to="/shop"
                    target="_blank"
                    className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black/60 hover:text-absolute-black transition-colors border-b border-absolute-black/20 pb-1"
                  >
                    Ver loja ↗
                  </Link>
                </div>

                {/* Aviso da segunda seccao */}
                <div className="flex items-start gap-3 bg-solar-yellow/15 border border-solar-yellow/40 px-5 py-4">
                  <span className="text-solar-yellow text-lg leading-none mt-0.5">☀</span>
                  <p className="font-mono text-[13px] tracking-widest text-absolute-black/70 leading-relaxed">
                    Os <strong>3 primeiros produtos</strong> aparecem na segunda seccao da homepage (destaque).
                    Usa as setas para reordenar.
                    {reordering && <span className="ml-2 opacity-50">A guardar...</span>}
                  </p>
                </div>

                {/* Cabecalho da tabela — desktop */}
                <div className="hidden md:grid grid-cols-[32px_64px_1fr_120px_140px_180px] gap-4 items-center border-b border-absolute-black/10 pb-3">
                  <span />
                  <span />
                  <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">Produto</span>
                  <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">Preco</span>
                  <span className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">Categoria</span>
                  <span />
                </div>

                <div className="flex flex-col divide-y divide-absolute-black/8">
                  {[...featuredProducts].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((product, idx) => {
                    const isSpotlight = idx < 3;
                    const sorted = [...featuredProducts].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                    return (
                    <div
                      key={product.id}
                      className={`grid grid-cols-[32px_64px_1fr] md:grid-cols-[32px_64px_1fr_120px_140px_180px] gap-4 items-center py-4 ${isSpotlight ? 'bg-solar-yellow/5' : ''}`}
                    >
                      {/* Setas reordenar */}
                      <div className="flex flex-col gap-0.5 items-center">
                        <button
                          onClick={() => reorderProduct(product.cjPid, 'up')}
                          disabled={idx === 0 || reordering}
                          aria-label="Mover para cima"
                          className="w-6 h-6 flex items-center justify-center text-absolute-black/30 hover:text-absolute-black disabled:opacity-15 transition-colors text-xs"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => reorderProduct(product.cjPid, 'down')}
                          disabled={idx === sorted.length - 1 || reordering}
                          aria-label="Mover para baixo"
                          className="w-6 h-6 flex items-center justify-center text-absolute-black/30 hover:text-absolute-black disabled:opacity-15 transition-colors text-xs"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Miniatura */}
                      <div className="relative w-16 h-20 overflow-hidden bg-bleached-concrete/20 shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSpotlight && (
                          <div className="absolute bottom-0 left-0 right-0 bg-solar-yellow text-absolute-black font-mono text-[9px] tracking-widest uppercase text-center py-0.5">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Nome + meta (mobile agrupa tudo) */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-[13px] tracking-wider text-absolute-black leading-tight line-clamp-2">
                            {product.name}
                          </p>
                          {isSpotlight && (
                            <span className="hidden md:inline-block shrink-0 font-mono text-[10px] tracking-widest uppercase bg-solar-yellow text-absolute-black px-1.5 py-0.5">
                              Destaque
                            </span>
                          )}
                        </div>
                        {/* Preco e categoria visiveis no mobile aqui */}
                        <div className="flex gap-3 md:hidden">
                          <span className="font-mono text-[13px] text-absolute-black/60">{product.price}</span>
                          {product.category && (
                            <span className="font-mono text-[13px] text-absolute-black/40">{product.category}</span>
                          )}
                        </div>
                        {/* Botoes no mobile */}
                        <div className="flex gap-3 mt-2 md:hidden">
                          <button
                            onClick={() => openDetails(product)}
                            className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]"
                          >
                            Editar
                          </button>
                          {confirmRemove === product.cjPid ? (
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => { toggleFeatured(product); setConfirmRemove(null); }}
                                disabled={saving === product.cjPid}
                                className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 bg-red-500 text-stark-white hover:bg-red-600 transition-colors min-h-[44px] disabled:opacity-50"
                              >
                                {saving === product.cjPid ? '...' : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => setConfirmRemove(null)}
                                className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRemove(product.cjPid)}
                              className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-red-300 text-red-500 hover:bg-red-50 transition-colors min-h-[44px]"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Preco — desktop */}
                      <span className="hidden md:block font-mono text-[13px] text-absolute-black/70">
                        {product.price}
                      </span>

                      {/* Categoria — desktop */}
                      <span className="hidden md:block font-mono text-[13px] text-absolute-black/40 tracking-widest uppercase">
                        {product.category || '—'}
                      </span>

                      {/* Acoes — desktop */}
                      <div className="hidden md:flex gap-3 items-center justify-end">
                        <button
                          onClick={() => openDetails(product)}
                          className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]"
                        >
                          Editar
                        </button>
                        {confirmRemove === product.cjPid ? (
                          <>
                            <button
                              onClick={() => { toggleFeatured(product); setConfirmRemove(null); }}
                              disabled={saving === product.cjPid}
                              className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 bg-red-500 text-stark-white hover:bg-red-600 transition-colors min-h-[44px] disabled:opacity-50"
                            >
                              {saving === product.cjPid ? '...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setConfirmRemove(null)}
                              className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px]"
                            >
                              Nao
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmRemove(product.cjPid)}
                            className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 border border-red-300 text-red-500 hover:bg-red-50 transition-colors min-h-[44px]"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
        {/* TAB: COLECOES */}
        {tab === 'collections' && (
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
                  <h2 className="font-serif italic text-2xl font-light mb-1">Colecoes</h2>
                  <p className="font-mono text-[13px] text-absolute-black/40 tracking-widest">
                    Agrupa os teus produtos em colecoes para organizar a loja.
                  </p>
                </div>
                {/* Criar nova colecao */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newCollectionName.trim()) {
                      setCollectionFilter(newCollectionName.trim());
                      setNewCollectionName('');
                    }
                  }}
                  className="flex gap-3 items-end"
                >
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/40">Nova Colecao</label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Ex: Verao 2025"
                      className="bg-transparent border-b border-absolute-black/20 px-3 py-2 font-mono text-sm focus:border-absolute-black outline-none transition-colors w-52"
                    />
                  </div>
                  <button
                    type="submit"
                    className="font-mono text-[13px] uppercase tracking-widest px-5 py-2 bg-absolute-black text-stark-white hover:bg-absolute-black/80 transition-colors min-h-[44px]"
                  >
                    Criar
                  </button>
                </form>
              </div>

              {/* Filtro de colecoes */}
              {(() => {
                const allCollections = Array.from(new Set(
                  featuredProducts.map(p => p.collection).filter(Boolean)
                )) as string[];
                const uncategorized = featuredProducts.filter(p => !p.collection);
                return (
                  <div className="flex flex-col gap-8">
                    {/* Pills de filtro */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setCollectionFilter(null)}
                        className={`font-mono text-[13px] uppercase tracking-widest px-4 py-2 border transition-colors ${
                          collectionFilter === null
                            ? 'bg-absolute-black text-stark-white border-absolute-black'
                            : 'border-absolute-black/20 text-absolute-black/60 hover:border-absolute-black/60'
                        }`}
                      >
                        Todas
                      </button>
                      {allCollections.map(col => (
                        <button
                          key={col}
                          onClick={() => setCollectionFilter(collectionFilter === col ? null : col)}
                          className={`font-mono text-[13px] uppercase tracking-widest px-4 py-2 border transition-colors ${
                            collectionFilter === col
                              ? 'bg-absolute-black text-stark-white border-absolute-black'
                              : 'border-absolute-black/20 text-absolute-black/60 hover:border-absolute-black/60'
                          }`}
                        >
                          {col} ({featuredProducts.filter(p => p.collection === col).length})
                        </button>
                      ))}
                      {uncategorized.length > 0 && (
                        <button
                          onClick={() => setCollectionFilter('__none__')}
                          className={`font-mono text-[13px] uppercase tracking-widest px-4 py-2 border transition-colors ${
                            collectionFilter === '__none__'
                              ? 'bg-absolute-black text-stark-white border-absolute-black'
                              : 'border-absolute-black/20 text-absolute-black/40 hover:border-absolute-black/40'
                          }`}
                        >
                          Sem colecao ({uncategorized.length})
                        </button>
                      )}
                    </div>

                    {/* Produtos filtrados */}
                    {featuredProducts.length === 0 ? (
                      <div className="flex flex-col items-center py-20 gap-4">
                        <p className="font-serif italic text-3xl text-absolute-black/30 font-light">Loja vazia</p>
                        <button
                          onClick={() => setTab('browse')}
                          className="font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border-b border-absolute-black/30 pb-1 hover:border-absolute-black transition-colors"
                        >
                          Adicionar produtos →
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Agrupado por colecao quando sem filtro */}
                        {collectionFilter === null ? (
                          <div className="flex flex-col gap-12">
                            {allCollections.map(col => (
                              <div key={col}>
                                <div className="flex items-center gap-4 mb-5">
                                  <h3 className="font-serif italic text-xl font-light">{col}</h3>
                                  <div className="flex-1 h-[0.5px] bg-absolute-black/10" />
                                  <span className="font-mono text-[13px] text-absolute-black/40 tracking-widest">
                                    {featuredProducts.filter(p => p.collection === col).length} produto{featuredProducts.filter(p => p.collection === col).length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                                  {featuredProducts
                                    .filter(p => p.collection === col)
                                    .map(product => (
                                      <div key={product.id} className="flex flex-col gap-2 group">
                                        <button
                                          onClick={() => openDetails(product)}
                                          className="relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20"
                                        >
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/30 transition-colors flex items-center justify-center">
                                            <span className="font-mono text-[13px] uppercase tracking-widest text-stark-white opacity-0 group-hover:opacity-100 transition-opacity">
                                              Editar
                                            </span>
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
                                  <h3 className="font-serif italic text-xl font-light text-absolute-black/40">Sem colecao</h3>
                                  <div className="flex-1 h-[0.5px] bg-absolute-black/10" />
                                  <span className="font-mono text-[13px] text-absolute-black/30 tracking-widest">{uncategorized.length}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                                  {uncategorized.map(product => (
                                    <div key={product.id} className="flex flex-col gap-2 group">
                                      <button
                                        onClick={() => { openDetails(product); setAdminTab('content'); }}
                                        className="relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20"
                                      >
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          loading="lazy"
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/20 transition-colors flex items-center justify-center">
                                          <span className="font-mono text-[13px] uppercase tracking-widest text-absolute-black opacity-0 group-hover:opacity-100 transition-opacity">
                                            Atribuir
                                          </span>
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
                          /* Vista filtrada por colecao */
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <h3 className="font-serif italic text-xl font-light">
                                {collectionFilter === '__none__' ? 'Sem colecao' : collectionFilter}
                              </h3>
                              <div className="flex-1 h-[0.5px] bg-absolute-black/10" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                              {featuredProducts
                                .filter(p =>
                                  collectionFilter === '__none__'
                                    ? !p.collection
                                    : p.collection === collectionFilter
                                )
                                .map(product => (
                                  <div key={product.id} className="flex flex-col gap-2 group">
                                    <button
                                      onClick={() => { openDetails(product); setAdminTab('content'); }}
                                      className="relative aspect-[3/4] overflow-hidden bg-bleached-concrete/20"
                                    >
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/30 transition-colors flex items-center justify-center">
                                        <span className="font-mono text-[13px] uppercase tracking-widest text-stark-white opacity-0 group-hover:opacity-100 transition-opacity">
                                          Editar
                                        </span>
                                      </div>
                                    </button>
                                    <p className="font-mono text-[13px] tracking-wider text-absolute-black/80 line-clamp-1">{product.name}</p>
                                    <p className="font-mono text-[13px] text-absolute-black/50">{product.price}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
        {/* TAB: ENCOMENDAS */}
        {tab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-8 md:px-12 py-10"
          >
            {/* Metricas */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Total de Encomendas', value: metrics.totalOrders },
                  { label: 'Receita Total', value: `€${metrics.totalRevenue.toFixed(2)}` },
                  { label: 'Valor Medio', value: `€${metrics.averageOrder.toFixed(2)}` },
                  { label: 'Em Processamento', value: metrics.statusCounts?.processing || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-solar-yellow/10 border border-solar-yellow/30 px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">{label}</p>
                    <p className="font-serif italic text-3xl font-light text-absolute-black">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Produto mais vendido */}
            {metrics?.topProducts?.length > 0 && (
              <div className="mb-8 p-5 bg-absolute-black/3 border border-absolute-black/8">
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-3">Mais Vendidos</p>
                <div className="flex flex-wrap gap-3">
                  {metrics.topProducts.map((p: any) => (
                    <div key={p.name} className="flex items-center gap-2 bg-stark-white px-3 py-2 border border-absolute-black/10">
                      <span className="font-mono text-[13px] text-absolute-black/70 truncate max-w-[180px]">{p.name}</span>
                      <span className="font-mono text-[13px] text-solar-yellow font-bold shrink-0">×{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de encomendas */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif italic text-2xl font-light">
                {ordersLoading ? 'A carregar...' : `${orders.length} encomenda${orders.length !== 1 ? 's' : ''}`}
              </h2>
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px] disabled:opacity-40"
              >
                Atualizar
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-bleached-concrete/20 animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center py-24 gap-4">
                <p className="font-serif italic text-3xl text-absolute-black/25 font-light">Sem encomendas ainda</p>
                <p className="font-mono text-[13px] text-absolute-black/30 tracking-widest">
                  As encomendas aparecem aqui apos o primeiro pagamento
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-absolute-black/8">
                {/* Header */}
                <div className="hidden md:grid grid-cols-[140px_1fr_100px_120px_120px] gap-4 pb-3 border-b border-absolute-black/10">
                  {['Encomenda', 'Cliente', 'Total', 'Estado', 'Data'].map(h => (
                    <span key={h} className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">{h}</span>
                  ))}
                </div>

                {orders.map(order => {
                  const isExpanded = expandedOrder === order.id;
                  const statusColor: Record<string, string> = {
                    processing: 'text-blue-600 bg-blue-50',
                    payment_received: 'text-green-600 bg-green-50',
                    shipped: 'text-purple-600 bg-purple-50',
                    delivered: 'text-absolute-black bg-solar-yellow/30',
                    cancelled: 'text-red-600 bg-red-50',
                  };
                  const statusLabel: Record<string, string> = {
                    processing: 'Em processo',
                    payment_received: 'Pago',
                    shipped: 'Enviado',
                    delivered: 'Entregue',
                    cancelled: 'Cancelado',
                  };
                  return (
                    <div key={order.id}>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="w-full grid grid-cols-1 md:grid-cols-[140px_1fr_100px_120px_120px] gap-2 md:gap-4 py-4 text-left hover:bg-absolute-black/2 transition-colors"
                      >
                        <span className="font-mono text-[13px] text-absolute-black font-medium tracking-wider">
                          {order.orderNumber || '—'}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[13px] text-absolute-black">{order.customerName || '—'}</span>
                          <span className="font-mono text-[13px] text-absolute-black/40">{order.customerEmail}</span>
                        </div>
                        <span className="font-mono text-[13px] text-absolute-black font-medium">
                          €{(order.total || 0).toFixed(2)}
                        </span>
                        <span className={`font-mono text-[13px] uppercase tracking-widest px-2 py-0.5 w-fit ${statusColor[order.status] || 'text-absolute-black/60 bg-absolute-black/5'}`}>
                          {statusLabel[order.status] || order.status}
                        </span>
                        <span className="font-mono text-[13px] text-absolute-black/40">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-PT') : '—'}
                        </span>
                      </button>

                      {/* Detalhes expandidos */}
                      {isExpanded && (
                        <div className="bg-absolute-black/3 border border-absolute-black/8 p-5 mb-2 flex flex-col md:flex-row gap-6">
                          {/* Morada */}
                          {order.shippingAddress && (
                            <div className="flex flex-col gap-1">
                              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">Envio</p>
                              <p className="font-mono text-[13px] text-absolute-black/70">{order.shippingAddress.name}</p>
                              <p className="font-mono text-[13px] text-absolute-black/70">{order.shippingAddress.address?.line1}</p>
                              <p className="font-mono text-[13px] text-absolute-black/70">
                                {order.shippingAddress.address?.postal_code} {order.shippingAddress.address?.city}
                              </p>
                              <p className="font-mono text-[13px] text-absolute-black/70">{order.shippingAddress.address?.country}</p>
                            </div>
                          )}

                          {/* Itens */}
                          <div className="flex flex-col gap-2 flex-1">
                            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">Produtos</p>
                            {(order.items as any[]).map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center gap-4">
                                <span className="font-mono text-[13px] text-absolute-black/70 line-clamp-1">{item.description || 'Produto'}</span>
                                <span className="font-mono text-[13px] text-absolute-black/50 shrink-0">×{item.quantity} — €{((item.amount_total || 0) / 100).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* CJ Order ID */}
                          {order.cjOrderId && (
                            <div className="flex flex-col gap-1">
                              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">CJ Order</p>
                              <p className="font-mono text-[13px] text-absolute-black/70">{order.cjOrderId}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCT SHEET MODAL */}
      <AnimatePresence>
        {viewingProduct && (
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
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center font-mono text-[13px] text-absolute-black/40 hover:text-absolute-black hover:rotate-90 transition-all border border-absolute-black/15 hover:border-absolute-black bg-raw-linen/90 backdrop-blur-sm"
              >
                ✕
              </button>

              {/* Split body */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* ── LEFT: Gallery ──────────────────────── */}
                <div className="lg:w-[40%] flex flex-row gap-2 p-4 border-b lg:border-b-0 lg:border-r border-absolute-black/8 bg-bleached-concrete/10 overflow-hidden">
                  {/* Vertical thumbnails */}
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
                            {/* Remove / restore button */}
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

                  {/* Main image */}
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
                    {/* Na loja badge */}
                    {featuredPids.includes(viewingProduct.cjPid) && (
                      <div className="absolute top-3 left-3 bg-solar-yellow text-absolute-black font-mono text-[10px] tracking-[0.3em] uppercase px-2 py-1">
                        Na Loja
                      </div>
                    )}
                    {/* Mobile thumbnails */}
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

                {/* ── RIGHT: Details ─────────────────────── */}
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
                      {(productDetail?.processingTime) && (
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
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Custo CJ</span>
                        <span className="font-mono text-base text-absolute-black/50 line-through">
                          {viewingProduct.price || (productDetail?.priceNum != null ? `€${productDetail.priceNum.toFixed(2)}` : '—')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
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

                    {/* Sizes / Variants */}
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
                                {/* Edit variant name */}
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
                    <div className="flex flex-col gap-2.5 pt-4 border-t border-absolute-black/8">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[11px] tracking-[0.4em] uppercase text-absolute-black/35">Envio → Portugal</label>
                        {shippingLoading && <span className="font-mono text-[11px] text-absolute-black/25 animate-pulse">A carregar...</span>}
                      </div>
                      {!shippingLoading && shippingMethods.length === 0 && (
                        <p className="font-mono text-[11px] text-absolute-black/25 tracking-widest">Sem métodos disponíveis da CJ para este produto.</p>
                      )}
                      {shippingMethods.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCustomShipping('')}
                            className={`flex items-center gap-3 px-4 py-3 border-2 text-left transition-all ${customShipping === '' ? 'border-absolute-black bg-absolute-black/3' : 'border-absolute-black/10 hover:border-absolute-black/25'}`}
                          >
                            <div className="flex-1">
                              <p className="font-mono text-[12px] uppercase tracking-widest text-absolute-black">Automático (CJ decide)</p>
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
                          const all = customImage && !base.includes(customImage) ? [customImage, ...base] : base;
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
                                {/* Toggle exclude */}
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
                  <p className="font-mono text-[13px] text-absolute-black/60">
                    <strong className="text-absolute-black">{selectedVids.length}</strong>
                    {(productDetail?.variants?.length ?? 0) > 0 && <span className="text-absolute-black/35"> / {productDetail.variants.length}</span>}
                    {' '}variantes ativas
                  </p>
                  <p className="font-mono text-[11px] text-absolute-black/30 tracking-widest">
                    {customShipping
                      ? `Envio: ${shippingMethods.find(m => m.id === customShipping)?.name || customShipping}`
                      : 'Envio: automático'}
                  </p>
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
        )}
      </AnimatePresence>
    </div>
  );
}

