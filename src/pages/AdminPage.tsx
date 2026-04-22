'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SfButton } from '@storefront-ui/react';
import { useCJProducts, type CJProduct } from '../hooks/useCJProducts';
import { supabase } from '../lib/supabase';
import { authFetch, handleAuthResponse } from '../admin/adminUtils';
import AdminDashboard from '../admin/AdminDashboard';
import AdminBrowse from '../admin/AdminBrowse';
import AdminStore from '../admin/AdminStore';
import AdminCollections from '../admin/AdminCollections';
import AdminOrders from '../admin/AdminOrders';
import AdminProductModal from '../admin/AdminProductModal';

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('admin_token'));
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'pid'>('name');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const [featuredPids, setFeaturedPids] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<CJProduct[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [tab, setTab] = useState<'dashboard' | 'browse' | 'store' | 'collections' | 'orders'>('dashboard');

  const [dashMetrics, setDashMetrics] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashRange, setDashRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeSupplier, setActiveSupplier] = useState<'cj' | 'matterhorn' | 'eprolo'>('cj');

  const [mhProducts, setMhProducts] = useState<any[]>([]);
  const [mhLoading, setMhLoading] = useState(false);
  const [mhTotal, setMhTotal] = useState(0);
  const [mhHasMore, setMhHasMore] = useState(false);
  const [mhPage, setMhPage] = useState(1);
  const [mhSearch, setMhSearch] = useState('');
  const [mhSearchInput, setMhSearchInput] = useState('');
  const [mhNewOnly, setMhNewOnly] = useState(false);

  const [epProducts, setEpProducts] = useState<any[]>([]);
  const [epLoading, setEpLoading] = useState(false);
  const [epTotal, setEpTotal] = useState(0);
  const [epHasMore, setEpHasMore] = useState(false);
  const [epPage, setEpPage] = useState(1);
  const [epSearch, setEpSearch] = useState('');
  const [epSearchInput, setEpSearchInput] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [kvError, setKvError] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

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
  const [customExtraImages, setCustomExtraImages] = useState<string[]>([]);

  const [globalSettings, setGlobalSettings] = useState<Record<string, string | null>>({});
  const [mhShippingMethods, setMhShippingMethods] = useState<any[]>([]);
  const [mhShippingLoading, setMhShippingLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const query = category === 'All' ? search : `${category} ${search}`.trim();
  const { products, total, loading } = useCJProducts({ query, page, pageSize: 24, searchMode });

  const loadFeatured = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/featured?t=${Date.now()}`);
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
      const res = await handleAuthResponse(await authFetch('/api/admin/orders'));
      const data = await res.json();
      setOrders(data.orders || []);
      setMetrics(data.metrics || null);
    } catch { /* silent */ }
    finally { setOrdersLoading(false); }
  }, []);

  const [refundingOrder, setRefundingOrder] = useState<string | null>(null);
  const issueRefund = useCallback(async (stripeSessionId: string, total: number) => {
    const input = window.prompt(
      `Reembolso para ${stripeSessionId}\nTotal pago: €${total.toFixed(2)}\n\nValor a reembolsar em € (deixar vazio = reembolso total):`
    );
    if (input === null) return;
    const amount = input.trim() === '' ? undefined : parseFloat(input.replace(',', '.'));
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) { alert('Valor inválido.'); return; }
    if (!window.confirm(`Confirmar reembolso de ${amount !== undefined ? `€${amount.toFixed(2)}` : 'valor total'} para ${stripeSessionId}?`)) return;
    setRefundingOrder(stripeSessionId);
    try {
      const res = await handleAuthResponse(await authFetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSessionId, amount }),
      }));
      const data = await res.json();
      if (!res.ok) {
        alert(`Reembolso falhou: ${data.error || 'erro desconhecido'}`);
      } else {
        alert(`Reembolso de €${data.refundedAmount.toFixed(2)} emitido com sucesso (ID: ${data.refundId})`);
        loadOrders();
      }
    } catch (e: any) {
      alert(`Reembolso falhou: ${e.message || e}`);
    } finally {
      setRefundingOrder(null);
    }
  }, [loadOrders]);

  const [retryingSupplier, setRetryingSupplier] = useState<string | null>(null);
  const retrySupplierOrder = useCallback(async (stripeSessionId: string, supplier: string) => {
    const key = `${stripeSessionId}:${supplier}`;
    setRetryingSupplier(key);
    try {
      const res = await handleAuthResponse(await authFetch('/api/admin/orders?action=retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSessionId, supplier }),
      }));
      const data = await res.json();
      if (!res.ok) {
        alert(`Retry falhou: ${data.error || 'erro desconhecido'}`);
      } else {
        alert('Retry concluído com sucesso');
        loadOrders();
      }
    } catch (e: any) {
      alert(`Retry falhou: ${e.message || e}`);
    } finally {
      setRetryingSupplier(null);
    }
  }, [loadOrders]);

  useEffect(() => {
    if (authed && tab === 'orders') loadOrders();
  }, [authed, tab, loadOrders]);

  const loadDashMetrics = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await handleAuthResponse(await authFetch(`/api/admin/metrics?range=${dashRange}`));
      const data = await res.json();
      setDashMetrics(data);
    } catch {
      setDashMetrics(null);
    } finally {
      setDashLoading(false);
    }
  }, [dashRange]);

  useEffect(() => {
    if (authed && tab === 'dashboard') loadDashMetrics();
  }, [authed, tab, loadDashMetrics]);

  useEffect(() => {
    if (!authed || tab !== 'store') return;
    authFetch('/api/admin/settings').then(handleAuthResponse).then(r => r.json()).then(d => setGlobalSettings(d)).catch(() => {});
    setMhShippingLoading(true);
    fetch('/api/matterhorn?action=delivery&country=pt')
      .then(r => r.json())
      .then(d => {
        const methods = (d.methods || []).map((m: any) => {
          const id = String(m.delivery_method_id ?? m.id ?? '');
          const price = parseFloat(m.price ?? m.cost ?? 0);
          return { id, name: m.name || m.delivery_name || id, price, priceFormatted: price === 0 ? 'Grátis' : `€${price.toFixed(2)}`, estimatedDelivery: m.delivery_time || 'Consultar' };
        });
        setMhShippingMethods(methods);
      })
      .catch(() => setMhShippingMethods([]))
      .finally(() => setMhShippingLoading(false));
  }, [authed, tab]);

  useEffect(() => {
    if (!authed || tab !== 'browse' || activeSupplier !== 'matterhorn') return;
    setMhLoading(true);
    const q = mhSearch.trim();
    const isEan = /^\d{8,14}$/.test(q);
    let fetchPromise: Promise<any>;
    if (isEan) {
      fetchPromise = fetch(`/api/matterhorn?action=byean&ean=${q}`).then(r => r.json()).catch(() => ({ products: [] }));
    } else if (q) {
      const params = new URLSearchParams({ page: '1', limit: '1000' });
      if (mhNewOnly) params.set('new_collection', '1');
      fetchPromise = fetch(`/api/matterhorn?action=products&${params}`).then(r => r.json()).catch(() => ({ products: [] }));
    } else {
      const params = new URLSearchParams({ page: String(mhPage), limit: '100' });
      if (mhNewOnly) params.set('new_collection', '1');
      fetchPromise = fetch(`/api/matterhorn?action=products&${params}`).then(r => r.json()).catch(() => ({ products: [] }));
    }
    fetchPromise.then(d => {
      const all: any[] = d.products || [];
      const ql = q.toLowerCase();
      const filtered = ql && !isEan
        ? all.filter((p: any) =>
            (p.name || '').toLowerCase().includes(ql) ||
            (p.brand || '').toLowerCase().includes(ql) ||
            (p.category || '').toLowerCase().includes(ql) ||
            String(p.id || '').includes(ql)
          )
        : all;
      setMhProducts(filtered);
      setMhTotal(filtered.length);
      setMhHasMore(!q && !!d.hasMore);
    }).catch(() => { setMhProducts([]); setMhTotal(0); })
      .finally(() => setMhLoading(false));
  }, [authed, tab, activeSupplier, mhPage, mhSearch, mhNewOnly]);

  useEffect(() => {
    if (!authed || tab !== 'browse' || activeSupplier !== 'eprolo') return;
    setEpLoading(true);
    const q = epSearch.trim().toLowerCase();
    fetch(`/api/eprolo?action=products&pageNum=${epPage}&pageSize=20&page_index=${epPage - 1}&page_size=20`)
      .then(r => r.json())
      .then(d => {
        const all: any[] = d.products || [];
        const filtered = q ? all.filter((p: any) => (p.name || '').toLowerCase().includes(q)) : all;
        setEpProducts(filtered);
        setEpTotal(filtered.length);
        setEpHasMore(!q && !!d.hasMore);
      })
      .catch(() => { setEpProducts([]); setEpTotal(0); })
      .finally(() => setEpLoading(false));
  }, [authed, tab, activeSupplier, epPage, epSearch]);

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
      await handleAuthResponse(await authFetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, action: 'reorder', items }),
      }));
      await loadFeatured();
    } finally {
      setReordering(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setPwError(false);
    try {
      const res = await fetch('/api/admin/settings?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setPwError(true);
        setTimeout(() => setPwError(false), 1200);
        return;
      }
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem('admin_token', data.token);
        sessionStorage.removeItem('admin_auth');
        setAuthed(true);
      }
    } catch {
      setPwError(true);
      setTimeout(() => setPwError(false), 1200);
    } finally {
      setLoggingIn(false);
    }
  };

  const toggleFeatured = async (product: CJProduct, vids?: string[]) => {
    const pid = product.cjPid;
    const action = featuredPids.includes(pid) && !vids ? 'remove' : 'add';
    setSaving(pid);
    setSaveError(null);
    try {
      const res = await handleAuthResponse(await authFetch('/api/admin/featured', {
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
            extraImages: customExtraImages.length > 0 ? customExtraImages : [],
            supplier: (product as any).supplier || 'cj',
          },
        }),
      }));
      const data = await res.json();
      if (data.ok) {
        if (action === 'add') {
          await loadFeatured();
          if (vids !== undefined) closeModal();
        } else {
          setFeaturedPids(data.pids);
          setFeaturedProducts(prev => prev.filter(p => p.cjPid !== pid));
        }
      } else {
        setSaveError(data.error || 'Erro desconhecido ao guardar');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Erro de ligação');
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
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setCustomExtraImages(prev => [...prev, data.publicUrl]);
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
      setCustomExtraImages((existing as any).extraImages || []);
    } else {
      setCustomName(''); setCustomDesc(''); setCustomImage(''); setCustomPrice('');
      setCustomCollection(''); setCustomShipping(''); setCustomVariantNames({});
      setExcludedImages([]); setCustomExtraImages([]);
    }

    setShippingMethods([]);
    setShippingLoading(true);
    try {
      const supplier = (product as any).supplier || 'cj';
      const firstVid = (product as any).variants?.[0]?.vid || (product as any).variants?.[0]?.variant_uid || '';
      const url = supplier === 'matterhorn'
        ? `/api/matterhorn?action=product&id=${product.cjPid}&includeShipping=true&country=PT`
        : supplier === 'eprolo'
        ? `/api/eprolo?action=product&id=${product.cjPid}&variantId=${firstVid}`
        : `/api/cj?action=product&pid=${product.cjPid}&includeShipping=true&country=PT`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.product) {
        setProductDetail(data.product);
        if (!existing?.selectedVids) {
          setSelectedVids(data.product.variants?.map((v: any) => v.vid || v.variant_uid) || []);
        }
      } else if (supplier === 'eprolo') {
        setProductDetail(product);
        if (!existing?.selectedVids) {
          setSelectedVids((product as any).variants?.map((v: any) => v.vid || v.variant_uid) || []);
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
    setSelectedVids(prev => prev.includes(vid) ? prev.filter(v => v !== vid) : [...prev, vid]);
  };

  const closeModal = () => {
    setViewingProduct(null);
    setVariantFilter('all');
    setCustomName(''); setCustomDesc(''); setCustomImage(''); setCustomPrice('');
    setCustomCollection(''); setCustomShipping(''); setCustomVariantNames({});
    setExcludedImages([]); setCustomExtraImages([]);
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
          <p className="font-mono text-[13px] tracking-[0.5em] uppercase text-stark-white/30">Solaris — Admin</p>
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
            disabled={loggingIn || !pw}
            className="!rounded-none !bg-solar-yellow !text-absolute-black font-mono text-[13px] tracking-[0.3em] uppercase w-full !py-3 disabled:opacity-50"
          >
            {loggingIn ? 'A entrar...' : 'Entrar →'}
          </SfButton>
        </motion.form>
      </div>
    );
  }

  // --- PAINEL ---
  return (
    <div className="min-h-screen bg-raw-linen text-absolute-black">
      <header className="sticky top-0 z-50 bg-deep-night text-stark-white border-b border-stark-white/10">
        <div className="flex items-center justify-between px-5 md:px-12 h-12">
          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/40 shrink-0">Solaris Admin</span>
          <Link to="/" className="font-mono text-[11px] tracking-widest uppercase text-stark-white/30 hover:text-stark-white transition-colors shrink-0">← Voltar</Link>
        </div>
        <nav className="flex border-t border-stark-white/10 overflow-x-auto scrollbar-none">
          {([
            ['dashboard', 'Dashboard'],
            ['browse', 'Explorar Catalogo'],
            ['store', `A Minha Loja (${featuredPids.length})`],
            ['collections', 'Colecoes'],
            ['orders', orders.length > 0 ? `Encomendas (${orders.length})` : 'Encomendas'],
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 font-mono text-[11px] md:text-[13px] tracking-widest uppercase px-5 md:px-8 py-3 transition-colors border-b-2 ${
                tab === t ? 'border-solar-yellow text-solar-yellow' : 'border-transparent text-stark-white/40 hover:text-stark-white'
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
        {tab === 'dashboard' && (
          <AdminDashboard
            dashMetrics={dashMetrics}
            dashLoading={dashLoading}
            dashRange={dashRange}
            setDashRange={setDashRange}
            loadDashMetrics={loadDashMetrics}
            onNavigateOrders={() => setTab('orders')}
            onNavigateStore={() => setTab('store')}
          />
        )}

        {tab === 'browse' && (
          <AdminBrowse
            activeSupplier={activeSupplier}
            setActiveSupplier={setActiveSupplier}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            category={category}
            setCategory={setCategory}
            page={page}
            setPage={setPage}
            products={products}
            total={total}
            loading={loading}
            mhProducts={mhProducts}
            mhLoading={mhLoading}
            mhTotal={mhTotal}
            mhHasMore={mhHasMore}
            mhPage={mhPage}
            setMhPage={setMhPage}
            mhSearchInput={mhSearchInput}
            setMhSearchInput={setMhSearchInput}
            setMhSearch={setMhSearch}
            mhNewOnly={mhNewOnly}
            setMhNewOnly={setMhNewOnly}
            epProducts={epProducts}
            epLoading={epLoading}
            epTotal={epTotal}
            epHasMore={epHasMore}
            epPage={epPage}
            setEpPage={setEpPage}
            epSearchInput={epSearchInput}
            setEpSearchInput={setEpSearchInput}
            setEpSearch={setEpSearch}
            featuredPids={featuredPids}
            saving={saving}
            toggleFeatured={toggleFeatured}
            openDetails={openDetails}
            handleSearch={handleSearch}
          />
        )}

        {tab === 'store' && (
          <AdminStore
            featuredProducts={featuredProducts}
            featuredPids={featuredPids}
            reorderProduct={reorderProduct}
            reordering={reordering}
            confirmRemove={confirmRemove}
            setConfirmRemove={setConfirmRemove}
            toggleFeatured={toggleFeatured}
            saving={saving}
            openDetails={openDetails}
            globalSettings={globalSettings}
            setGlobalSettings={setGlobalSettings}
            mhShippingMethods={mhShippingMethods}
            mhShippingLoading={mhShippingLoading}
            savingSettings={savingSettings}
            setSavingSettings={setSavingSettings}
            onNavigateBrowse={() => setTab('browse')}
          />
        )}

        {tab === 'collections' && (
          <AdminCollections
            featuredProducts={featuredProducts}
            newCollectionName={newCollectionName}
            setNewCollectionName={setNewCollectionName}
            collectionFilter={collectionFilter}
            setCollectionFilter={setCollectionFilter}
            openDetails={openDetails}
            setAdminTab={setAdminTab}
            onNavigateBrowse={() => setTab('browse')}
          />
        )}

        {tab === 'orders' && (
          <AdminOrders
            orders={orders}
            metrics={metrics}
            ordersLoading={ordersLoading}
            expandedOrder={expandedOrder}
            setExpandedOrder={setExpandedOrder}
            loadOrders={loadOrders}
            retryingSupplier={retryingSupplier}
            retrySupplierOrder={retrySupplierOrder}
            refundingOrder={refundingOrder}
            issueRefund={issueRefund}
          />
        )}
      </AnimatePresence>

      <AdminProductModal
        viewingProduct={viewingProduct}
        productDetail={productDetail}
        detailLoading={detailLoading}
        shippingMethods={shippingMethods}
        shippingLoading={shippingLoading}
        selectedVids={selectedVids}
        setSelectedVids={setSelectedVids}
        customName={customName}
        setCustomName={setCustomName}
        customDesc={customDesc}
        setCustomDesc={setCustomDesc}
        customImage={customImage}
        setCustomImage={setCustomImage}
        customPrice={customPrice}
        setCustomPrice={setCustomPrice}
        customCollection={customCollection}
        setCustomCollection={setCustomCollection}
        customShipping={customShipping}
        setCustomShipping={setCustomShipping}
        customVariantNames={customVariantNames}
        setCustomVariantNames={setCustomVariantNames}
        editingVid={editingVid}
        setEditingVid={setEditingVid}
        uploading={uploading}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        previewColor={previewColor}
        setPreviewColor={setPreviewColor}
        excludedImages={excludedImages}
        setExcludedImages={setExcludedImages}
        customExtraImages={customExtraImages}
        globalSettings={globalSettings}
        mhShippingMethods={mhShippingMethods}
        featuredPids={featuredPids}
        featuredProducts={featuredProducts}
        saving={saving}
        saveError={saveError}
        closeModal={closeModal}
        toggleVid={toggleVid}
        toggleFeatured={toggleFeatured}
        handleUpload={handleUpload}
        setTab={setTab}
      />
    </div>
  );
}
