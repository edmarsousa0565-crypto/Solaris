// ─── Catálogo SOLARIS — 18 Produtos Vencedores Verão 2025/26 ──────────────────
// Seleccionados com base em tendências Vogue PT, WGSN, TikTok Creative Center
// Margens: 65–80% · AOV Alvo: €49 · Mercados: PT · BR

export interface Product {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  category: string;
  collection: string;
  image: string;
  description: string;
  sizes: string[];
  colors?: string[];
  isNew?: boolean;
  isSoldOut?: boolean;
  tier?: 'hero' | 'viral' | 'upsell' | 'sazonal';
  marketingAngle?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  season: string;
  image: string;
  count: number;
}

// ─── Coleções ─────────────────────────────────────────────────────────────────

export const COLLECTIONS: Collection[] = [
  {
    id: 'verao-2025',
    name: 'Verão 2025',
    description: 'Os 6 produtos hero da temporada. Bestsellers confirmados nas tendências verão lusófono.',
    season: 'SS 2025',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
    count: 6,
  },
  {
    id: 'resort-praia',
    name: 'Resort & Praia',
    description: 'Da praia ao bar. Peças fluidas e virais para os dias mais longos do ano.',
    season: 'SS 2025',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    count: 6,
  },
  {
    id: 'acessorios',
    name: 'Acessórios',
    description: 'Alta margem, impulso garantido. Completa qualquer look SOLARIS.',
    season: 'Perene',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop',
    count: 6,
  },
];

// ─── Categorias para filtros ───────────────────────────────────────────────────

export const CATEGORIES = ['All', 'Vestidos', 'Conjuntos', 'Tops', 'Calçado', 'Acessórios'];

// ─── Produtos ─────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [

  // ════════════ VERO 2025 — TIER 1: HEROES ════════════

  {
    id: 1,
    name: 'Vestido Longo Boho Floral',
    price: '€49',
    priceNum: 49,
    category: 'Vestidos',
    collection: 'Verão 2025',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    description: 'Vestido fluido com estampas étnicas e renda. Comprimento maxi. Disponível em terracota, amarelo manteiga, branco e verde pistache. O produto mais pesquisado no verão lusófono.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Terracota', 'Amarelo', 'Branco', 'Verde'],
    isNew: true,
    tier: 'hero',
    marketingAngle: 'O vestido que vai contigo da praia ao jantar — sem mudar nada.',
  },
  {
    id: 2,
    name: 'Conjunto Linho Coordenado',
    price: '€57',
    priceNum: 57,
    category: 'Conjuntos',
    collection: 'Verão 2025',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop',
    description: 'Top + calção ou saia midi em linho puro. Cores neutras: bege, branco, verde sage, terracota. Alta AOV — a cliente compra o conjunto completo.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Bege', 'Branco', 'Verde Sage', 'Terracota'],
    isNew: true,
    tier: 'hero',
    marketingAngle: 'O conjunto que as fashionistas portuguesas estão a usar este verão.',
  },
  {
    id: 3,
    name: 'Vestido Midi Floral',
    price: '€47',
    priceNum: 47,
    category: 'Vestidos',
    collection: 'Verão 2025',
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1000&auto=format&fit=crop',
    description: 'Estampas grandes de flores e frutas. Modelos curtos a midi. Confirmado pela WGSN como key piece primavera-verão 25/26. Disponível em pink, coral e amarelo.',
    sizes: ['S', 'M', 'L'],
    colors: ['Pink', 'Coral', 'Amarelo'],
    isNew: true,
    tier: 'hero',
    marketingAngle: 'As flores do verão — do campo à cidade, do brunch à festa.',
  },
  {
    id: 4,
    name: 'Camisa Listrada Náutica',
    price: '€39',
    priceNum: 39,
    category: 'Tops',
    collection: 'Verão 2025',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1000&auto=format&fit=crop',
    description: 'Riscas clássicas azul/branco e novos tons laranja, verde e rosa. Modelo camisa ou vestido curto. Confirmado pela Vogue PT e Elle Brasil como indispensável do verão europeu.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Azul/Branco', 'Laranja/Branco', 'Rosa/Branco'],
    tier: 'hero',
    marketingAngle: 'O clássico do verão europeu — fresco, elegante, atemporal.',
  },
  {
    id: 5,
    name: 'Vestido Animal Print',
    price: '€44',
    priceNum: 44,
    category: 'Vestidos',
    collection: 'Verão 2025',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000&auto=format&fit=crop',
    description: 'Oncinha, zebra e leopardo — confirmados pela Elle Brasil e Vogue como mega tendência verão 2025. Modelos curtos a midi. Alta conversão em anúncios.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Leopardo', 'Zebra', 'Oncinha'],
    isNew: true,
    tier: 'hero',
    marketingAngle: 'A fera do verão — para quem não passa despercebida.',
  },
  {
    id: 6,
    name: 'Maxi Dress Backless',
    price: '€55',
    priceNum: 55,
    category: 'Vestidos',
    collection: 'Verão 2025',
    image: 'https://images.unsplash.com/photo-1549062300-47b85e098864?q=80&w=1000&auto=format&fit=crop',
    description: 'Vestido maxi sem alças, costas abertas ou assimétrico. AutoDS confirma como bestseller de verão. Perfeito para eventos e noites quentes.',
    sizes: ['S', 'M', 'L'],
    colors: ['Preto', 'Branco', 'Coral', 'Azul'],
    isNew: true,
    tier: 'sazonal',
    marketingAngle: 'O vestido para as noites de verão que ficam na memória.',
  },

  // ════════════ RESORT & PRAIA — TIER 2: VIRAIS ════════════

  {
    id: 7,
    name: 'Kimono Praia Étnico',
    price: '€32',
    priceNum: 32,
    category: 'Tops',
    collection: 'Resort & Praia',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop',
    description: 'Saída de praia fluida com prints étnicos ou florais. Upsell perfeito — a cliente que compra biquíni ou fato de banho leva sempre este.',
    sizes: ['S/M', 'M/L', 'XL'],
    colors: ['Turquesa', 'Coral', 'Amarelo', 'Multicolor'],
    tier: 'viral',
    marketingAngle: 'Transição beach-to-bar: biquíni → kimono → pronto para o jantar.',
  },
  {
    id: 8,
    name: 'Conjunto Resort Wide-Leg',
    price: '€52',
    priceNum: 52,
    category: 'Conjuntos',
    collection: 'Resort & Praia',
    image: 'https://images.unsplash.com/photo-1550614000-4b95d4158173?q=80&w=1000&auto=format&fit=crop',
    description: 'Top cropped + calça wide-leg em tecido fluido. Spocket confirma como top produto dropshipping verão. Perfeito para o mercado PT onde o look resort é tendência crescente.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Bege', 'Branco', 'Azul Céu', 'Rosa'],
    isNew: true,
    tier: 'sazonal',
    marketingAngle: 'O look resort que as portuguesas vão querer este verão.',
  },
  {
    id: 9,
    name: 'Top Crochet Boho',
    price: '€27',
    priceNum: 27,
    category: 'Tops',
    collection: 'Resort & Praia',
    image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=1000&auto=format&fit=crop',
    description: 'Tops em crochet ou renda — grande expressão do boho 2025 confirmado pela Vogue PT. Blusa de amarração frontal também em alta. Custo baixo, margem altíssima.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Branco', 'Bege', 'Preto', 'Terracota'],
    tier: 'viral',
    marketingAngle: '"Feito à mão, vestido com alma — o espírito do verão."',
  },
  {
    id: 10,
    name: 'Bodysuit Rendado Coquette',
    price: '€35',
    priceNum: 35,
    category: 'Tops',
    collection: 'Resort & Praia',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop',
    description: 'Bodysuits com renda, laços e detalhes coquette. FashionNetwork confirma como top 10 tendência primavera-verão 25. Básico renovado para 2025.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Branco', 'Preto', 'Rosa Baby', 'Nude'],
    isNew: true,
    tier: 'sazonal',
    marketingAngle: 'Feminina, delicada, irresistível — o bodysuit que vai fazer toda a diferença.',
  },
  {
    id: 11,
    name: 'Sandálias Fisherman',
    price: '€33',
    priceNum: 33,
    category: 'Calçado',
    collection: 'Resort & Praia',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    description: 'Fisherman sandals confirmadas pela Vicenza como "um dos grandes hits do verão 2025". Design robusto e confortável. Viral no TikTok com 700M+ visualizações mensais.',
    sizes: ['36', '37', '38', '39', '40', '41'],
    colors: ['Preto', 'Castanho', 'Bege'],
    tier: 'viral',
    marketingAngle: 'GRWM com outfit completo SOLARIS — do sapato ao chapéu.',
  },
  {
    id: 12,
    name: 'Mini Shoulder Bag Palha',
    price: '€25',
    priceNum: 25,
    category: 'Acessórios',
    collection: 'Resort & Praia',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop',
    description: '#BagTok tem 1.2B views no TikTok. Bolsa mini em palha ou crochê. Impulse buy natural — a cliente compra junto com qualquer roupa.',
    sizes: ['One Size'],
    colors: ['Natural', 'Bege', 'Preto'],
    tier: 'viral',
    marketingAngle: '"What\'s in my bag" + outfit do dia = viral garantido.',
  },

  // ════════════ ACESSÓRIOS — TIER 3: UPSELLS ════════════

  {
    id: 13,
    name: 'Chapéu de Palha Aba Larga',
    price: '€19',
    priceNum: 19,
    category: 'Acessórios',
    collection: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1000&auto=format&fit=crop',
    description: 'Aparece em todo o conteúdo de praia e viagem. Custo ultra-baixo, margem máxima 80%. Bundle natural com qualquer vestido ou kimono da coleção.',
    sizes: ['One Size'],
    colors: ['Natural', 'Bege'],
    tier: 'upsell',
  },
  {
    id: 14,
    name: 'Óculos de Sol Oversized',
    price: '€17',
    priceNum: 17,
    category: 'Acessórios',
    collection: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop',
    description: 'Compra por impulso clássica. Frames oversized ou vintage Y2K. Altíssima margem 78%, envio leve. Perfeito no checkout como upsell.',
    sizes: ['One Size'],
    colors: ['Preto', 'Tortoiseshell', 'Branco', 'Dourado'],
    tier: 'upsell',
  },
  {
    id: 15,
    name: 'Conjunto Jóias Finas',
    price: '€20',
    priceNum: 20,
    category: 'Acessórios',
    collection: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    description: 'Colar longo + brincos metálicos. WGSN confirma crescimento de 4.8% em pulseiras e colares na passarela S/S 25. Low-key luxury em alta.',
    sizes: ['One Size'],
    colors: ['Dourado', 'Prateado'],
    tier: 'upsell',
  },
  {
    id: 16,
    name: 'Bolsa Tote Praia Palha',
    price: '€28',
    priceNum: 28,
    category: 'Acessórios',
    collection: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
    description: 'Tote ou cesto de praia em palha. Espaçosa para toalha, protetor solar e o kimono. Bundle perfeito com o Conjunto Linho ou qualquer vestido da coleção Verão 2025.',
    sizes: ['One Size'],
    colors: ['Natural', 'Natural/Preto'],
    tier: 'upsell',
  },
  {
    id: 17,
    name: 'Pulseiras Boho Empilháveis',
    price: '€15',
    priceNum: 15,
    category: 'Acessórios',
    collection: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1000&auto=format&fit=crop',
    description: 'Set de pulseiras boho para empilhar. Missangas, contas naturais, fios dourados. Tendência stack jewelry 2025. Margem 80% e custo mínimo de envio.',
    sizes: ['One Size'],
    colors: ['Multicolor', 'Bege/Dourado', 'Azul/Branco'],
    tier: 'upsell',
  },
  {
    id: 18,
    name: 'Lenço de Seda / Foulard',
    price: '€22',
    priceNum: 22,
    category: 'Acessórios',
    collection: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1601610817436-547df1259695?q=80&w=1000&auto=format&fit=crop',
    description: 'Foulard em seda ou cetim com print floral ou geométrico. Usa na cabeça, no cabelo, no pescoço ou na mala. Versatilidade máxima, margem excelente.',
    sizes: ['One Size'],
    colors: ['Floral Pink', 'Azul/Dourado', 'Terracota', 'Preto/Branco'],
    tier: 'upsell',
  },
];
