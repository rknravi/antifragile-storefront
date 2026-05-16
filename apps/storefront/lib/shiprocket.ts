/**
 * Shiprocket (or similar) — stub for future integration.
 * Set SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD and call token + create order APIs when ready.
 */
export function isShiprocketConfigured(): boolean {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

export async function createShiprocketShipmentPlaceholder(_orderId: string): Promise<{ ok: false; message: string }> {
  return {
    ok: false,
    message:
      "Shiprocket integration not implemented. Add API calls per https://apidocs.shiprocket.in/ when you have pickup + order data.",
  };
}
