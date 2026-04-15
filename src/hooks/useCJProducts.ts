import { useState, useEffect } from 'react';

export interface CJProduct {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  category: string;
  collection: string;
  description: string;
  sizes: string[];
  colors?: string[];
  variants?: any[];
  isNew: boolean;
  isSoldOut: boolean;
  cjPid: string;
  selectedVids?: string[];
  sortOrder?: number;
}

interface UseCJProductsOptions {
  query?: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
}

export function useCJProducts(options: UseCJProductsOptions = {}) {
  const { query = '', page = 1, pageSize = 20, categoryId = '' } = options;

  const [products, setProducts] = useState<CJProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      query,
      page: String(page),
      pageSize: String(pageSize),
      ...(categoryId ? { categoryId } : {}),
    });

    fetch(`/api/cj/products?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query, page, pageSize, categoryId]);

  return { products, total, loading, error };
}
