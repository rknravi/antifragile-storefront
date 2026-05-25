"use client";

import { addressKey, formatSavedAddressLabel, type SavedAddress } from "@/lib/shipping-address";

type Props = {
  addresses: SavedAddress[];
  value: string;
  onChange: (key: string) => void;
  inputClassName: string;
};

export function CheckoutSavedAddressSelect({ addresses, value, onChange, inputClassName }: Props) {
  if (addresses.length === 0) return null;

  return (
    <div>
      <label className="text-sm text-neutral-700" htmlFor="checkout-saved-address">
        Saved address
      </label>
      <select
        id="checkout-saved-address"
        className={inputClassName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Choose a saved shipping address"
      >
        <option value="">Enter a new address</option>
        {addresses.map((addr) => {
          const key = addressKey(addr);
          const label = formatSavedAddressLabel(addr);
          const suffix = addr.isDefault ? " (most recent)" : "";
          return (
            <option key={key} value={key}>
              {label}
              {suffix}
            </option>
          );
        })}
      </select>
      <p className="mt-1 text-xs text-neutral-500">
        {addresses.length > 1
          ? "Choose a previous delivery address or enter a new one below."
          : "We filled your last delivery address. Choose “Enter a new address” to change it."}
      </p>
    </div>
  );
}
