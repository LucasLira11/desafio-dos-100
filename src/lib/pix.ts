// Gera o "PIX Copia e Cola" (BR Code) seguindo o padrão EMV do Banco Central,
// sem depender de nenhuma API paga — é só montagem de string + checksum.
// Referência: Manual de Padrões para Iniciação do Pix (BR Code), Bacen.

interface GeneratePixPayloadInput {
  key: string;
  name: string;
  city: string;
  amount: number;
  txId?: string;
}

// Monta um campo EMV no formato ID + tamanho (2 dígitos) + valor.
function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

// O EMV exige texto simples: sem acento, maiúsculo, só alfanumérico e espaço.
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove os acentos separados pelo normalize
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — checksum exigido no campo final (63).
function crc16(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Gera a string do PIX Copia e Cola (BR Code estático) a partir da chave PIX,
 * nome do recebedor, cidade e valor total. O resultado pode ser copiado
 * direto no app do banco ou transformado em QR Code.
 */
export function generatePixPayload({ key, name, city, amount, txId = "***" }: GeneratePixPayloadInput): string {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", key.trim());
  const additionalData = tlv("05", sanitize(txId, 25) || "***");

  const payloadWithoutCrc =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", merchantAccountInfo) + // Merchant Account Information (PIX)
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Transaction Currency (BRL)
    tlv("54", amount.toFixed(2)) + // Transaction Amount
    tlv("58", "BR") + // Country Code
    tlv("59", sanitize(name, 25) || "RECEBEDOR") + // Merchant Name
    tlv("60", sanitize(city, 15) || "BRASIL") + // Merchant City
    tlv("62", additionalData) + // Additional Data Field Template (txid)
    "6304"; // ID + tamanho fixo do campo CRC, valor calculado a seguir

  return payloadWithoutCrc + crc16(payloadWithoutCrc);
}
