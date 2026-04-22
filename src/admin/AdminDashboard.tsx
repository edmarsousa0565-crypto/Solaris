'use client';

import { motion } from 'motion/react';
import { downloadCsv } from './adminUtils';

interface Props {
  dashMetrics: any;
  dashLoading: boolean;
  dashRange: '7d' | '30d' | '90d' | 'all';
  setDashRange: (r: '7d' | '30d' | '90d' | 'all') => void;
  loadDashMetrics: () => void;
  onNavigateOrders: () => void;
  onNavigateStore: () => void;
}

export default function AdminDashboard({ dashMetrics, dashLoading, dashRange, setDashRange, loadDashMetrics, onNavigateOrders, onNavigateStore }: Props) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-8 md:px-12 py-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="font-serif italic text-3xl font-light">Visão Geral do Negócio</h2>
        <div className="flex gap-1">
          {(['7d', '30d', '90d', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setDashRange(r)}
              className={`font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                dashRange === r
                  ? 'bg-absolute-black text-stark-white border-absolute-black'
                  : 'border-absolute-black/15 text-absolute-black/60 hover:border-absolute-black/50'
              }`}
            >
              {r === 'all' ? 'Tudo' : r === '7d' ? '7 dias' : r === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
          <button
            onClick={loadDashMetrics}
            disabled={dashLoading}
            className="ml-2 font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 border border-absolute-black/15 hover:border-absolute-black/50 disabled:opacity-40"
          >
            ↻
          </button>
        </div>
      </div>

      {dashLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-bleached-concrete/30 animate-pulse" />
          ))}
        </div>
      ) : !dashMetrics ? (
        <p className="font-mono text-[13px] text-absolute-black/50">Sem dados disponíveis. Garante que tens o Supabase configurado.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-solar-yellow/10 border border-solar-yellow/30 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/50 mb-2">Receita</p>
              <p className="font-serif italic text-3xl font-light">€{dashMetrics.totals.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-absolute-black text-stark-white px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-stark-white/50 mb-2">Encomendas</p>
              <p className="font-serif italic text-3xl font-light">{dashMetrics.totals.orderCount}</p>
            </div>
            <div className="bg-stark-white border border-absolute-black/10 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/50 mb-2">Valor médio</p>
              <p className="font-serif italic text-3xl font-light">€{dashMetrics.totals.aov.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-red-700/70 mb-2">Pagamentos MH pendentes</p>
              <p className="font-serif italic text-3xl font-light text-red-700">{dashMetrics.pendingMatterhornPayments?.length || 0}</p>
            </div>
          </div>

          {dashMetrics.pendingMatterhornPayments?.length > 0 && (
            <div className="mb-10 border border-red-200 bg-red-50/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-red-700">⚠ Pagar à Matterhorn ({dashMetrics.pendingMatterhornPayments.length})</p>
              </div>
              <div className="flex flex-col gap-2">
                {dashMetrics.pendingMatterhornPayments.slice(0, 5).map((p: any) => (
                  <div key={p.matterhornOrderId} className="flex items-center justify-between bg-stark-white border border-red-100 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[13px] text-absolute-black">{p.orderNumber} · MH #{p.matterhornOrderId}</span>
                      <span className="font-mono text-[11px] text-absolute-black/50">{p.customerEmail}</span>
                    </div>
                    <a
                      href={p.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] tracking-widest uppercase px-3 py-2 bg-red-600 text-stark-white hover:bg-red-700 transition-colors"
                    >
                      Pagar agora →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="border border-absolute-black/10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-4">Por Fornecedor</p>
              <div className="flex flex-col gap-3">
                {Object.entries(dashMetrics.bySupplier as Record<string, any>).map(([key, val]: any) => (
                  val.count > 0 && (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/70">
                        {key === 'cj' ? 'CJ Dropshipping' : key === 'matterhorn' ? 'Matterhorn' : 'Mistas'}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[13px] text-absolute-black/50">{val.count} enc.</span>
                        <span className="font-mono text-[13px] font-medium text-absolute-black">€{val.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            <div className="border border-absolute-black/10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-4">Estado das Encomendas</p>
              <div className="flex flex-col gap-3">
                {Object.entries(dashMetrics.byStatus as Record<string, number>).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="font-mono text-[13px] uppercase tracking-widest text-absolute-black/70">{status}</span>
                    <span className="font-mono text-[13px] font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {dashMetrics.topProducts?.length > 0 && (
            <div className="border border-absolute-black/10 p-5 mb-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-absolute-black/40 mb-4">Top Produtos (por receita)</p>
              <div className="flex flex-col divide-y divide-absolute-black/5">
                {dashMetrics.topProducts.slice(0, 10).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-absolute-black/30 w-6">#{i + 1}</span>
                      <span className="font-mono text-[13px] text-absolute-black/80 truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-[13px] text-absolute-black/50">×{p.count}</span>
                      <span className="font-mono text-[13px] font-medium">€{p.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadCsv(`/api/admin/orders?format=csv&range=${dashRange}`, `solaris-orders-${dashRange}.csv`)}
              className="font-mono text-[11px] tracking-widest uppercase px-4 py-2.5 border border-absolute-black hover:bg-absolute-black hover:text-stark-white transition-colors"
            >
              ↓ Exportar CSV
            </button>
            <button
              onClick={onNavigateOrders}
              className="font-mono text-[11px] tracking-widest uppercase px-4 py-2.5 border border-absolute-black/20 hover:border-absolute-black transition-colors"
            >
              Ver encomendas →
            </button>
            <button
              onClick={onNavigateStore}
              className="font-mono text-[11px] tracking-widest uppercase px-4 py-2.5 border border-absolute-black/20 hover:border-absolute-black transition-colors"
            >
              Gerir loja →
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
