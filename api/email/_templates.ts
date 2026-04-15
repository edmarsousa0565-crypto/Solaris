// Templates de email HTML — identidade visual SOLARIS
// Usados pelo endpoint api/email/send.ts

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  price: string;
  quantity: number;
  image?: string;
}

export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: OrderItem[];
  total: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery: string; // ex: "7-14 dias úteis"
}

export interface ShippingData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  estimatedDelivery: string;
}

export interface DeliveredData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  reviewUrl?: string;
}

// ─── Layout base ──────────────────────────────────────────────────────────────

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#FAF5EF;font-family:'Helvetica Neue',Arial,sans-serif;color:#1C1410;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1C1410;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;letter-spacing:8px;color:#F4A623;font-weight:300;font-family:Georgia,serif;">SOLARIS</p>
              <p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.35);">Moda Feminina Verão</p>
            </td>
          </tr>

          <!-- Content -->
          ${content}

          <!-- Footer -->
          <tr>
            <td style="background:#1C1410;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                Questões? <a href="mailto:edmar@pakkaz.com" style="color:#F4A623;text-decoration:none;">edmar@pakkaz.com</a>
              </p>
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);">
                © 2026 SOLARIS · <a href="https://solaris.pt/privacidade" style="color:rgba(255,255,255,0.3);text-decoration:none;">Privacidade</a>
                &nbsp;·&nbsp;
                <a href="https://solaris.pt/devolucoes" style="color:rgba(255,255,255,0.3);text-decoration:none;">Devoluções</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Template 1: Confirmação de Encomenda ─────────────────────────────────────

export function orderConfirmationTemplate(data: OrderConfirmationData): { subject: string; html: string } {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E8D5B7;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#1C1410;">${item.name}</td>
            <td style="font-size:13px;color:#7A6752;text-align:center;width:40px;">×${item.quantity}</td>
            <td style="font-size:13px;font-weight:600;color:#1C1410;text-align:right;width:80px;">${item.price}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const content = `
    <!-- Banner de confirmação -->
    <tr>
      <td style="background:#F4A623;padding:32px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">✓</p>
        <p style="margin:0;font-size:22px;font-family:Georgia,serif;font-weight:300;color:#1C1410;">Encomenda Confirmada</p>
        <p style="margin:8px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(28,20,16,0.6);">#${data.orderNumber}</p>
      </td>
    </tr>

    <!-- Saudação -->
    <tr>
      <td style="background:white;padding:32px 40px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D3128;">
          Olá <strong>${data.customerName}</strong>,<br>
          Recebemos a tua encomenda e já estamos a prepará-la. Receberás um email com o número de tracking assim que for enviada.
        </p>

        <!-- Itens -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6752;padding-bottom:8px;border-bottom:2px solid #1C1410;">Artigos</td>
          </tr>
          ${itemsHtml}
          <tr>
            <td style="padding:16px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;font-weight:700;color:#1C1410;">Total</td>
                  <td style="font-size:18px;font-family:Georgia,serif;font-weight:600;color:#C17D0E;text-align:right;">${data.total}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Morada de envio -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border:1px solid #E8D5B7;border-radius:8px;margin:16px 0;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6752;">Morada de Entrega</p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#3D3128;">
                ${data.shippingAddress.name}<br>
                ${data.shippingAddress.line1}<br>
                ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
                ${data.shippingAddress.country}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;font-size:12px;color:#7A6752;text-align:center;">
          Prazo estimado de entrega: <strong style="color:#1C1410;">${data.estimatedDelivery}</strong>
        </p>
      </td>
    </tr>
  `;

  return {
    subject: `✓ Encomenda #${data.orderNumber} confirmada — SOLARIS`,
    html: baseLayout(`Confirmação de Encomenda #${data.orderNumber}`, content),
  };
}

// ─── Template 2: Envio + Tracking ─────────────────────────────────────────────

export function shippingTemplate(data: ShippingData): { subject: string; html: string } {
  const content = `
    <!-- Banner de envio -->
    <tr>
      <td style="background:#1C1410;padding:32px 40px;text-align:center;border-bottom:3px solid #F4A623;">
        <p style="margin:0 0 8px;font-size:32px;">📦</p>
        <p style="margin:0;font-size:22px;font-family:Georgia,serif;font-weight:300;color:white;">A caminho!</p>
        <p style="margin:8px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);">Encomenda #${data.orderNumber}</p>
      </td>
    </tr>

    <!-- Conteúdo -->
    <tr>
      <td style="background:white;padding:32px 40px;">
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3D3128;">
          Olá <strong>${data.customerName}</strong>,<br>
          A tua encomenda foi enviada pelo transportador <strong>${data.carrier}</strong> e está a caminho.
        </p>

        <!-- Tracking box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border:2px solid #F4A623;border-radius:10px;margin:0 0 24px;">
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6752;">Número de Tracking</p>
              <p style="margin:0 0 16px;font-size:20px;font-family:Georgia,serif;font-weight:600;color:#1C1410;letter-spacing:2px;">${data.trackingNumber}</p>
              <a href="${data.trackingUrl}"
                style="display:inline-block;background:#1C1410;color:#F4A623;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;border-radius:4px;">
                Rastrear Encomenda →
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:12px;color:#7A6752;text-align:center;">
          Entrega estimada: <strong style="color:#1C1410;">${data.estimatedDelivery}</strong>
        </p>
      </td>
    </tr>
  `;

  return {
    subject: `📦 A tua encomenda SOLARIS está a caminho — #${data.orderNumber}`,
    html: baseLayout(`Encomenda enviada #${data.orderNumber}`, content),
  };
}

// ─── Template 3: Entrega + Pedido de Review ────────────────────────────────────

export function deliveredTemplate(data: DeliveredData): { subject: string; html: string } {
  const reviewSection = data.reviewUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border:1px solid #E8D5B7;border-radius:10px;margin:24px 0 0;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1C1410;">Gostaste da tua encomenda?</p>
          <p style="margin:0 0 16px;font-size:12px;color:#7A6752;">A tua opinião ajuda outras clientes a escolher melhor.</p>
          <a href="${data.reviewUrl}"
            style="display:inline-block;background:#F4A623;color:#1C1410;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;border-radius:4px;font-weight:600;">
            Deixar Avaliação ★
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  const content = `
    <!-- Banner de entrega -->
    <tr>
      <td style="background:#2D6A4F;padding:32px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:32px;">🌟</p>
        <p style="margin:0;font-size:22px;font-family:Georgia,serif;font-weight:300;color:white;">Entregue!</p>
        <p style="margin:8px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Encomenda #${data.orderNumber}</p>
      </td>
    </tr>

    <!-- Conteúdo -->
    <tr>
      <td style="background:white;padding:32px 40px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D3128;">
          Olá <strong>${data.customerName}</strong>,<br>
          A tua encomenda foi entregue! Esperamos que adores as tuas novas peças SOLARIS. ☀️
        </p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3D3128;">
          Se tiveres qualquer problema com a encomenda, tens <strong>30 dias</strong> para devolver.
          Contacta-nos em <a href="mailto:edmar@pakkaz.com" style="color:#C17D0E;">edmar@pakkaz.com</a>.
        </p>
        ${reviewSection}
      </td>
    </tr>
  `;

  return {
    subject: `🌟 A tua encomenda SOLARIS chegou! #${data.orderNumber}`,
    html: baseLayout(`Encomenda entregue #${data.orderNumber}`, content),
  };
}

// ─── Template 4: Boas-Vindas + Código de Desconto ─────────────────────────────

export function welcomeEmailTemplate(discountCode: string = 'SOLARIS10'): { subject: string; html: string } {
  const content = `
    <!-- Banner de boas-vindas -->
    <tr>
      <td style="background:#F4A623;padding:40px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:38px;">☀️</p>
        <p style="margin:0;font-size:26px;font-family:Georgia,serif;font-weight:300;color:#1C1410;">Bem-vinda à família.</p>
        <p style="margin:10px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(28,20,16,0.55);">SOLARIS — Moda Feminina</p>
      </td>
    </tr>

    <!-- Conteúdo -->
    <tr>
      <td style="background:white;padding:36px 40px;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#3D3128;">
          Obrigada por te juntares à comunidade SOLARIS.<br>
          Como prometido, aqui está o teu código exclusivo de <strong>10% de desconto</strong> na primeira encomenda:
        </p>

        <!-- Caixa do código -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border:2px dashed #F4A623;border-radius:10px;margin:0 0 28px;">
          <tr>
            <td style="padding:28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#7A6752;">O teu código</p>
              <p style="margin:0 0 20px;font-size:30px;font-family:Georgia,serif;font-weight:700;color:#1C1410;letter-spacing:6px;">${discountCode}</p>
              <a href="https://solaris.pt/shop"
                style="display:inline-block;background:#1C1410;color:#F4A623;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 36px;font-weight:600;">
                Usar Agora →
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 10px;font-size:12px;color:#7A6752;line-height:1.7;">
          ✦ &nbsp;Válido para a primeira encomenda<br>
          ✦ &nbsp;Sem valor mínimo de compra<br>
          ✦ &nbsp;Expira em 30 dias
        </p>

        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#3D3128;">
          Serás a primeira a saber das novas coleções, drops exclusivos e promoções privadas.<br>
          <strong>Até breve,</strong><br>
          <em style="font-family:Georgia,serif;">Equipa SOLARIS</em>
        </p>
      </td>
    </tr>
  `;

  return {
    subject: '☀️ O teu código −10% está aqui — SOLARIS',
    html: baseLayout('Bem-vinda à SOLARIS', content),
  };
}

// ─── Template 5: Notificação Admin — Nova Encomenda ──────────────────────────

export interface AdminOrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  cjOrderId: string | null;
}

export function adminOrderNotificationTemplate(data: AdminOrderNotificationData): { subject: string; html: string } {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(28,20,16,0.08);font-size:13px;color:#3D3128;">${item.quantity}× ${item.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid rgba(28,20,16,0.08);font-size:13px;color:#3D3128;text-align:right;">${item.price}</td>
    </tr>
  `).join('');

  const content = `
    <tr>
      <td style="padding:32px 40px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#7A6752;">Nova Encomenda</p>
        <h1 style="margin:0 0 24px;font-size:28px;font-family:Georgia,serif;font-weight:300;color:#1C1410;">#${data.orderNumber}</h1>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="font-size:12px;color:#7A6752;letter-spacing:2px;text-transform:uppercase;padding-bottom:4px;">Cliente</td>
          </tr>
          <tr>
            <td style="font-size:15px;color:#1C1410;font-weight:500;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#7A6752;">${data.customerEmail}</td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-top:1px solid rgba(28,20,16,0.1);">
          ${itemRows}
          <tr>
            <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1C1410;">Total</td>
            <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1C1410;text-align:right;">${data.total}</td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5EF;border:1px solid rgba(28,20,16,0.1);padding:16px;margin-bottom:24px;">
          <tr>
            <td style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7A6752;padding-bottom:8px;">Enviar para</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#3D3128;line-height:1.6;">
              ${data.shippingAddress.name}<br>
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
              ${data.shippingAddress.country}
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:12px;color:${data.cjOrderId ? '#2D7A4F' : '#C0392B'};">
          ${data.cjOrderId
            ? `✓ Encomenda CJ criada automaticamente: <strong>${data.cjOrderId}</strong>`
            : '⚠ Encomenda CJ NÃO criada — verificar manualmente no painel CJ Dropshipping'}
        </p>
      </td>
    </tr>
  `;

  return {
    subject: `🛍 Nova encomenda ${data.orderNumber} — ${data.total}`,
    html: baseLayout(`Nova Encomenda ${data.orderNumber}`, content),
  };
}
