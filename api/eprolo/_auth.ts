import crypto from 'crypto';

export const EPROLO_BASE_URL = 'https://api.eprolo.com/api'; 
// A documentação menciona o endpoint /eprolo_product_list.html
// Se a base URL for diferente (ex: https://app.eprolo.com/api), ajustaremos aqui.

/**
 * Gera os parâmetros de autenticação exigidos pela EPROLO.
 * Normalmente inclui o openApiKey, o timestamp e a assinatura (sign) MD5.
 */
export function getEproloAuthParams() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const apiKey = process.env.EPROLO_API_KEY || '';
  const apiSecret = process.env.EPROLO_API_SECRET || '';
  
  // A assinatura (sign) padrão geralmente é a concatenação destas chaves. Caso a ordem real
  // seja 'apiKey + timestamp + apiSecret' etc., poderemos ajustar rapidamente após o primeiro teste.
  const str = `${apiKey}${apiSecret}${timestamp}`;
  const sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();

  return {
    openApiKey: apiKey,
    timestamp,
    sign
  };
}
