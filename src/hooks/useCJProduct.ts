import { useState, useEffect } from 'react';

export interface CJProductDetail {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  images: string[];
  category: string;
  collection: string;
  description: string;
  variants: { vid: string; variant_uid?: string; name: string; price: number; stock: number; image: string }[];
  sizes: string[];
  cjPid: string;
  shippingTime: string;
  isNew: boolean;
  isSoldOut: boolean;
  supplier?: 'cj' | 'matterhorn' | 'eprolo';
  matterhorn_id?: string;
}

export function useCJProduct(pid: string | undefined, supplier: 'cj' | 'matterhorn' | 'eprolo' = 'cj') {
  const [product, setProduct] = useState<CJProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) return;
    setLoading(true);
    setError(null);

    const url = supplier === 'matterhorn'
      ? `/api/matterhorn?action=product&id=${pid}`
      : `/api/cj?action=product&pid=${pid}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        const p = data.product;
        // Normaliza para ambos os fornecedores
        const normalized: CJProductDetail = {
          ...p,
          cjPid: p.cjPid || p.pid || pid,
          supplier: supplier,
          matterhorn_id: supplier === 'matterhorn' ? (p.matterhorn_id || p.id) : undefined,
          variants: (p.variants || []).map((v: any) => ({
            vid: v.vid || v.variant_uid,
            variant_uid: v.variant_uid || v.vid,
            name: v.name || v.variantNameEn,
            price: v.price || v.sellPrice || v.variantSellPrice || 0,
            stock: v.stock ?? v.variantStock ?? 0,
            image: v.image || v.variantImage || '',
          })),
        };
        setProduct(normalized);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [pid, supplier]);

  return { product, loading, error };
}
