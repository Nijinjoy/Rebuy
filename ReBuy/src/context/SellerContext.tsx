import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type SellerType = 'individual' | 'company';

type SellerContextValue = {
  // Null until the user picks one on the Sell tab.
  sellerType: SellerType | null;
  // Pass null to ask again.
  setSellerType: (type: SellerType | null) => void;
};

const SellerContext = createContext<SellerContextValue | null>(null);

// Kept in memory until seller profiles exist in the API.
export function SellerProvider({ children }: { children: ReactNode }) {
  const [sellerType, setSellerType] = useState<SellerType | null>(null);

  const value = useMemo<SellerContextValue>(
    () => ({ sellerType, setSellerType }),
    [sellerType],
  );

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used inside SellerProvider');
  }
  return context;
}
