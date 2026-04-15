// POST /api/admin/seed-winners
// Pesquisa os 18 produtos vencedores na CJ API, escolhe o melhor match de cada
// e popula a tabela featured_products no Supabase com metadata em PT.
//
// Requer: VITE_ADMIN_PASSWORD (ou ADMIN_PASSWORD) no header X-Admin-Password
//
// Uso:
//   curl -X POST https://solaris.pt/api/admin/seed-winners \
//        -H "X-Admin-Password: <password>"

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCJToken, CJ_BASE_URL } from '../cj/_auth';

// ─── Catálogo dos 18 Produtos Vencedores ────────────────────────────────────

const WINNERS = [
  // ── Verão 2025 ──
  {
    sortOrder: 1,
    ptName: 'Vestido Longo Boho Floral',
    ptDesc: 'Vestido fluido com estampas étnicas e renda. Comprimento maxi. Disponível em terracota, amarelo manteiga, branco e verde pistache. O produto mais pesquisado no verão lusófono.',
    targetPrice: 49,
    priceMin: 12, priceMax: 20,
    collection: 'Verão 2025',
    category: 'Vestidos',
    queries: ['boho floral maxi dress', 'ethnic print dress', 'floral embroidery dress'],
  },
  {
    sortOrder: 2,
    ptName: 'Conjunto Linho Coordenado',
    ptDesc: 'Top + calção ou saia midi em linho puro. Cores neutras: bege, branco, verde sage, terracota. Alta AOV — a cliente compra o conjunto completo.',
    targetPrice: 57,
    priceMin: 16, priceMax: 22,
    collection: 'Verão 2025',
    category: 'Conjuntos',
    queries: ['two piece set women summer', 'matching set women', 'co ord set women'],
  },
  {
    sortOrder: 3,
    ptName: 'Vestido Midi Floral',
    ptDesc: 'Estampas grandes de flores e frutas. Modelos curtos a midi. Confirmado pela WGSN como key piece primavera-verão 25/26. Disponível em pink, coral e amarelo.',
    targetPrice: 47,
    priceMin: 13, priceMax: 19,
    collection: 'Verão 2025',
    category: 'Vestidos',
    queries: ['floral midi dress', 'floral print dress women', 'flower maxi dress'],
  },
  {
    sortOrder: 4,
    ptName: 'Camisa Listrada Náutica',
    ptDesc: 'Riscas clássicas azul/branco e novos tons laranja, verde e rosa. Modelo camisa ou vestido curto. Confirmado pela Vogue PT e Elle Brasil como indispensável do verão europeu.',
    targetPrice: 39,
    priceMin: 10, priceMax: 16,
    collection: 'Verão 2025',
    category: 'Tops',
    queries: ['striped shirt women', 'stripe blouse women', 'women stripe top shirt'],
  },
  {
    sortOrder: 5,
    ptName: 'Vestido Animal Print',
    ptDesc: 'Oncinha, zebra e leopardo — confirmados pela Elle Brasil e Vogue como mega tendência verão 2025. Modelos curtos a midi. Alta conversão em anúncios.',
    targetPrice: 44,
    priceMin: 11, priceMax: 17,
    collection: 'Verão 2025',
    category: 'Vestidos',
    queries: ['leopard dress women', 'print dress women summer', 'women casual dress print'],
  },
  {
    sortOrder: 6,
    ptName: 'Maxi Dress Backless',
    ptDesc: 'Vestido maxi sem alças, costas abertas ou assimétrico. AutoDS confirma como bestseller de verão. Perfeito para eventos e noites quentes.',
    targetPrice: 55,
    priceMin: 14, priceMax: 21,
    collection: 'Verão 2025',
    category: 'Vestidos',
    queries: ['backless maxi dress', 'asymmetric maxi dress', 'open back dress'],
  },
  // ── Resort & Praia ──
  {
    sortOrder: 7,
    ptName: 'Kimono Praia Étnico',
    ptDesc: 'Saída de praia fluida com prints étnicos ou florais. Upsell perfeito — a cliente que compra biquíni ou fato de banho leva sempre este.',
    targetPrice: 32,
    priceMin: 7, priceMax: 12,
    collection: 'Resort & Praia',
    category: 'Tops',
    queries: ['beach cover up women', 'swimsuit cover up', 'women beach cardigan'],
  },
  {
    sortOrder: 8,
    ptName: 'Conjunto Resort Wide-Leg',
    ptDesc: 'Top cropped + calça wide-leg em tecido fluido. Spocket confirma como top produto dropshipping verão. Perfeito para o mercado PT onde o look resort é tendência crescente.',
    targetPrice: 52,
    priceMin: 15, priceMax: 21,
    collection: 'Resort & Praia',
    category: 'Conjuntos',
    queries: ['wide leg pants women', 'palazzo pants women', 'women wide leg trousers'],
  },
  {
    sortOrder: 9,
    ptName: 'Top Crochet Boho',
    ptDesc: 'Tops em crochet ou renda — grande expressão do boho 2025 confirmado pela Vogue PT. Blusa de amarração frontal também em alta. Custo baixo, margem altíssima.',
    targetPrice: 27,
    priceMin: 6, priceMax: 10,
    collection: 'Resort & Praia',
    category: 'Tops',
    queries: ['crochet top women', 'lace boho blouse', 'crocheted lace top'],
  },
  {
    sortOrder: 10,
    ptName: 'Bodysuit Rendado Coquette',
    ptDesc: 'Bodysuits com renda, laços e detalhes coquette. FashionNetwork confirma como top 10 tendência primavera-verão 25. Básico renovado para 2025.',
    targetPrice: 35,
    priceMin: 8, priceMax: 13,
    collection: 'Resort & Praia',
    category: 'Tops',
    queries: ['bodysuit women lace', 'women bodysuit top', 'lace bodysuit sexy'],
  },
  {
    sortOrder: 11,
    ptName: 'Sandálias Fisherman',
    ptDesc: 'Fisherman sandals confirmadas pela Vicenza como "um dos grandes hits do verão 2025". Design robusto e confortável. Viral no TikTok com 700M+ visualizações mensais.',
    targetPrice: 33,
    priceMin: 7, priceMax: 13,
    collection: 'Resort & Praia',
    category: 'Calçado',
    queries: ['sandals women flat', 'women summer sandals', 'flat shoes women summer'],
  },
  {
    sortOrder: 12,
    ptName: 'Mini Shoulder Bag Palha',
    ptDesc: '#BagTok tem 1.2B views no TikTok. Bolsa mini em palha ou crochê. Impulse buy natural — a cliente compra junto com qualquer roupa.',
    targetPrice: 25,
    priceMin: 5, priceMax: 9,
    collection: 'Resort & Praia',
    category: 'Acessórios',
    queries: ['mini straw bag', 'woven shoulder bag', 'straw crossbody bag'],
  },
  // ── Acessórios ──
  {
    sortOrder: 13,
    ptName: 'Chapéu de Palha Aba Larga',
    ptDesc: 'Aparece em todo o conteúdo de praia e viagem. Custo ultra-baixo, margem máxima 80%. Bundle natural com qualquer vestido ou kimono da coleção.',
    targetPrice: 19,
    priceMin: 3, priceMax: 6,
    collection: 'Acessórios',
    category: 'Acessórios',
    queries: ['straw hat women', 'sun hat women beach', 'women hat summer straw'],
  },
  {
    sortOrder: 14,
    ptName: 'Óculos de Sol Oversized',
    ptDesc: 'Compra por impulso clássica. Frames oversized ou vintage Y2K. Altíssima margem 78%, envio leve. Perfeito no checkout como upsell.',
    targetPrice: 17,
    priceMin: 3, priceMax: 6,
    collection: 'Acessórios',
    category: 'Acessórios',
    queries: ['sunglasses women', 'fashion sunglasses women', 'retro sunglasses women'],
  },
  {
    sortOrder: 15,
    ptName: 'Conjunto Joias Finas',
    ptDesc: 'Colar longo + brincos metálicos. WGSN confirma crescimento de 4.8% em pulseiras e colares na passarela S/S 25. Low-key luxury em alta.',
    targetPrice: 20,
    priceMin: 4, priceMax: 8,
    collection: 'Acessórios',
    category: 'Acessórios',
    queries: ['jewelry set necklace earrings', 'layered jewelry set', 'fine jewelry set'],
  },
  {
    sortOrder: 16,
    ptName: 'Bolsa Tote Praia Palha',
    ptDesc: 'Tote ou cesto de praia em palha. Espaçosa para toalha, protetor solar e o kimono. Bundle perfeito com o Conjunto Linho ou qualquer vestido da coleção Verão 2025.',
    targetPrice: 28,
    priceMin: 6, priceMax: 10,
    collection: 'Acessórios',
    category: 'Acessórios',
    queries: ['tote bag women straw', 'beach bag women', 'women shoulder bag summer'],
  },
  {
    sortOrder: 17,
    ptName: 'Pulseiras Boho Empilhaveis',
    ptDesc: 'Set de pulseiras boho para empilhar. Missangas, contas naturais, fios dourados. Tendência stack jewelry 2025. Margem 80% e custo mínimo de envio.',
    targetPrice: 15,
    priceMin: 2, priceMax: 5,
    collection: 'Acessórios',
    category: 'Acessórios',
    queries: ['bracelet women set', 'charm bracelet women', 'women bangle bracelet set'],
  },
  {
    sortOrder: 18,
    ptName: 'Lenco de Seda Estampado',
    ptDesc: 'Foulard em seda ou cetim com print floral ou geométrico. Usa na cabeça, no cabelo, no pescoço ou na mala. Versatilidade máxima, margem excelente.',
    targetPrice: 22,
    priceMin: 4, priceMax: 8,
    collection: 'Acessórios',
    category: 'Acessórios',
    queries: ['silk scarf women', 'printed silk scarf', 'silk head scarf'],
  },
];

// ─── Helper: pesquisa CJ e devolve o melhor match ────────────────────────────

async function findBestCJMatch(
  token: string,
  queries: string[],
  priceMin: number,
  priceMax: number,
  usedPids: Set<string>
): Promise<{ pid: string; image: string; cjPrice: number } | null> {
  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        productNameEn: query,
        pageNum: '1',
        pageSize: '20',
      });

      const res = await fetch(`${CJ_BASE_URL}/product/list?${params}`, {
        headers: { 'CJ-Access-Token': token },
      });

      // Lê como texto e preserva PIDs como strings (evita perda de precisão de inteiros 64-bit)
      const raw = await res.text();
      const safeJson = raw.replace(/"pid"\s*:\s*(\d+)/g, '"pid":"$1"');
      const data = JSON.parse(safeJson);
      if (!data.result || !data.data?.list?.length) continue;

      const list: any[] = data.data.list;

      // Filtra por preço dentro do range de custo esperado (± 50% tolerância)
      const filtered = list.filter(p => {
        const price = parseFloat(p.sellPrice || '0');
        return price >= priceMin * 0.5 && price <= priceMax * 2;
      });

      const candidates = filtered.length > 0 ? filtered : list;

      // Prefere produtos com imagem válida e PID ainda não usado
      const withImage = candidates.filter(p =>
        p.productImage &&
        !p.productImage.includes('placeholder') &&
        !usedPids.has(String(p.pid))
      );
      const pool = withImage.length > 0 ? withImage :
        candidates.filter(p => !usedPids.has(String(p.pid)));

      if (pool.length > 0) {
        const p = pool[0];
        return {
          pid: String(p.pid),
          image: p.productImage,
          cjPrice: parseFloat(p.sellPrice || '0'),
        };
      }
    } catch {
      // Falha silenciosa — tenta próxima query
    }
  }
  return null;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Autenticação simples por password
  const adminPw = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
  const reqPw = req.headers['x-admin-password'] || req.body?.password;
  if (adminPw && reqPw !== adminPw) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
    { db: { schema: 'api' } }
  );

  let token: string;
  try {
    token = await getCJToken();
  } catch (err: any) {
    return res.status(503).json({ error: 'CJ Auth failed: ' + err.message });
  }

  const results: Array<{
    sortOrder: number;
    name: string;
    status: 'seeded' | 'not_found' | 'error';
    pid?: string;
    targetPrice: number;
    reason?: string;
  }> = [];

  // Opcional: limpar produtos existentes antes de semear
  const clearExisting = req.body?.clearExisting !== false;
  if (clearExisting) {
    await supabase.from('featured_products').delete().neq('pid', 'NEVER_MATCHES');
  }

  // Rastreia PIDs já usados para evitar duplicados
  const usedPids = new Set<string>();

  // Processa cada produto sequencialmente para não sobrecarregar a API CJ
  for (const winner of WINNERS) {
    try {
      const match = await findBestCJMatch(token, winner.queries, winner.priceMin, winner.priceMax, usedPids);

      if (!match) {
        results.push({ sortOrder: winner.sortOrder, name: winner.ptName, status: 'not_found', targetPrice: winner.targetPrice });
        continue;
      }
      usedPids.add(match.pid);

      const { error } = await supabase.from('featured_products').upsert({
        pid: match.pid,
        vids: [],
        custom_name: winner.ptName,
        custom_description: winner.ptDesc,
        custom_image: match.image || null, // guarda a imagem da CJ no Supabase
        custom_price: winner.targetPrice,
        collection: winner.collection,
        category: winner.category,
        sort_order: winner.sortOrder,
      }, { onConflict: 'pid' });

      if (error) {
        results.push({ sortOrder: winner.sortOrder, name: winner.ptName, status: 'error', pid: match.pid, targetPrice: winner.targetPrice, reason: error.message });
      } else {
        results.push({ sortOrder: winner.sortOrder, name: winner.ptName, status: 'seeded', pid: match.pid, targetPrice: winner.targetPrice });
      }

      // Pausa de 200ms entre chamadas CJ para evitar rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (err: any) {
      results.push({ sortOrder: winner.sortOrder, name: winner.ptName, status: 'error', targetPrice: winner.targetPrice, reason: err.message });
    }
  }

  const seeded = results.filter(r => r.status === 'seeded').length;
  const notFound = results.filter(r => r.status === 'not_found').length;
  const errors = results.filter(r => r.status === 'error').length;

  return res.status(200).json({
    summary: { total: WINNERS.length, seeded, notFound, errors },
    results,
  });
}
