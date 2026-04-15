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
  variants: { vid: string; name: string; price: number; stock: number; image: string }[];
  sizes: string[];
  cjPid: string;
  shippingTime: string;
  isNew: boolean;
  isSoldOut: boolean;
}

export function useCJProduct(pid: string | undefined) {
  const [product, setProduct] = useState<CJProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) return;
    setLoading(true);
    setError(null);

    fetch(`/api/cj/product?pid=${pid}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProduct(data.product);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [pid]);

  return { product, loading, error };
}
