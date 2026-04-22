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
  supplier?: 'cj' | 'matterhorn' | 'eprolo';
  matterhorn_id?: string;
}

interface UseCJProductsOptions {
  query?: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
  searchMode?: 'name' | 'pid';
}

export function useCJProducts(options: UseCJProductsOptions = {}) {
  const { query = '', page = 1, pageSize = 20, categoryId = '', searchMode = 'name' } = options;

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
      searchMode,
      ...(categoryId ? { categoryId } : {}),
    });

    fetch(`/api/cj?action=products&${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query, page, pageSize, categoryId, searchMode]);

  return { products, total, loading, error };
}
