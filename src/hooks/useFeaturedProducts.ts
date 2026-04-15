import { useState, useEffect } from 'react';
import type { CJProduct } from './useCJProducts';

export function useFeaturedProducts() {
  const [products, setProducts] = useState<CJProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/featured')
      .then(r => r.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
        // Sem fallback para produtos fictícios — a loja só mostra produtos reais
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
