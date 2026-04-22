'use client';

import { motion } from 'motion/react';
import { downloadCsv } from './adminUtils';

interface Props {
  orders: any[];
  metrics: any;
  ordersLoading: boolean;
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  loadOrders: () => void;
  retryingSupplier: string | null;
  retrySupplierOrder: (stripeSessionId: string, supplier: string) => void;
  refundingOrder: string | null;
  issueRefund: (stripeSessionId: string, total: number) => void;
}

const statusColor: Record<string, string> = {
  processing: 'text-blue-600 bg-blue-50',
  payment_received: 'text-green-600 bg-green-50',
  supplier_failed: 'text-red-700 bg-red-100',
  shipped: 'text-purple-600 bg-purple-50',
  delivered: 'text-absolute-black bg-solar-yellow/30',
  cancelled: 'text-red-600 bg-red-50',
  refunded: 'text-gray-500 bg-gray-100',
  partially_refunded: 'text-orange-600 bg-orange-50',
};

const statusLabel: Record<string, string> = {
  processing: 'Em processo',
  payment_received: 'Pago',
  supplier_failed: 'Falhou fornecedor',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  partially_refunded: 'Reembolso Parcial',
};

export default function AdminOrders({ orders, metrics, ordersLoading, expandedOrder, setExpandedOrder, loadOrders, retryingSupplier, retrySupplierOrder, refundingOrder, issueRefund }: Props) {
  return (
    <motion.div
      key="orders"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-8 md:px-12 py-10"
    >
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

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="font-serif italic text-2xl font-light">
          {ordersLoading ? 'A carregar...' : `${orders.length} encomenda${orders.length !== 1 ? 's' : ''}`}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadCsv('/api/admin/orders?format=csv&range=all', 'solaris-orders-all.csv')}
            className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px] flex items-center"
          >
            ↓ CSV
          </button>
          <button
            onClick={loadOrders}
            disabled={ordersLoading}
            className="font-mono text-[13px] uppercase tracking-widest px-4 py-2 border border-absolute-black/20 hover:border-absolute-black transition-colors min-h-[44px] disabled:opacity-40"
          >
            Atualizar
          </button>
        </div>
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
          <div className="hidden md:grid grid-cols-[140px_1fr_100px_120px_120px] gap-4 pb-3 border-b border-absolute-black/10">
            {['Encomenda', 'Cliente', 'Total', 'Estado', 'Data'].map(h => (
              <span key={h} className="font-mono text-[13px] uppercase tracking-[0.3em] text-absolute-black/40">{h}</span>
            ))}
          </div>

          {orders.map(order => {
            const isExpanded = expandedOrder === order.id;
            const supplierErrors = (order.supplierErrors || {}) as Record<string, string>;
            const errorSuppliers = Object.keys(supplierErrors);
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

                {errorSuppliers.length > 0 && (
                  <div className="border-l-4 border-red-600 bg-red-50 px-4 py-3 mb-2 flex flex-col gap-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-red-700 font-bold">⚠ Encomenda pendente — {errorSuppliers.length} fornecedor(es) falharam</p>
                    {errorSuppliers.map(sup => (
                      <div key={sup} className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                        <p className="font-mono text-[12px] text-red-900">
                          <span className="uppercase font-bold">{sup}</span>: {supplierErrors[sup]}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); retrySupplierOrder(order.stripeSessionId, sup); }}
                          disabled={retryingSupplier === `${order.stripeSessionId}:${sup}`}
                          className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 bg-red-600 text-stark-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit shrink-0"
                        >
                          {retryingSupplier === `${order.stripeSessionId}:${sup}` ? 'A tentar…' : 'Retry'}
                        </button>
                      </div>
                    ))}
                    {order.retryCount > 0 && (
                      <p className="font-mono text-[10px] text-red-700/70">Tentativas anteriores: {order.retryCount}</p>
                    )}
                  </div>
                )}

                {isExpanded && (
                  <div className="bg-absolute-black/3 border border-absolute-black/8 p-5 mb-2 flex flex-col md:flex-row gap-6">
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

                    <div className="flex flex-col gap-2 flex-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">Produtos</p>
                      {(order.items as any[]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center gap-4">
                          <span className="font-mono text-[13px] text-absolute-black/70 line-clamp-1">{item.description || 'Produto'}</span>
                          <span className="font-mono text-[13px] text-absolute-black/50 shrink-0">×{item.quantity} — €{((item.amount_total || 0) / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.cjOrderId && (
                      <div className="flex flex-col gap-1">
                        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">CJ Order</p>
                        <p className="font-mono text-[13px] text-absolute-black/70">{order.cjOrderId}</p>
                      </div>
                    )}

                    {(order.matterhornOrderId || order.matterhorn_order_id) && (
                      <div className="flex flex-col gap-1">
                        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">Matterhorn</p>
                        <p className="font-mono text-[13px] text-absolute-black/70">#{order.matterhornOrderId || order.matterhorn_order_id}</p>
                        {(order.matterhornPaymentUrl || order.matterhorn_payment_url) && (
                          <a
                            href={order.matterhornPaymentUrl || order.matterhorn_payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 bg-red-600 text-stark-white hover:bg-red-700 transition-colors w-fit mt-1"
                          >
                            Pagar MH →
                          </a>
                        )}
                      </div>
                    )}

                    {order.eproloOrderId && (
                      <div className="flex flex-col gap-1">
                        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">Eprolo</p>
                        <p className="font-mono text-[13px] text-absolute-black/70">#{order.eproloOrderId}</p>
                      </div>
                    )}

                    {!['refunded'].includes(order.status) && (
                      <div className="flex flex-col gap-1 border-l-2 border-absolute-black/10 pl-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-2">Reembolso</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); issueRefund(order.stripeSessionId, order.total); }}
                          disabled={refundingOrder === order.stripeSessionId}
                          className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border border-absolute-black/30 text-absolute-black/70 hover:bg-absolute-black hover:text-stark-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit"
                        >
                          {refundingOrder === order.stripeSessionId ? 'A processar…' : 'Emitir Reembolso'}
                        </button>
                        {order.status === 'partially_refunded' && (
                          <p className="font-mono text-[10px] text-absolute-black/50">Parcialmente reembolsado</p>
                        )}
                      </div>
                    )}
                    {order.status === 'refunded' && (
                      <div className="flex flex-col gap-1 border-l-2 border-green-400 pl-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-green-700 mb-1">Reembolsado</p>
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
  );
}
