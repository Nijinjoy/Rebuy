import { ReactNode } from 'react';
import { CartProvider } from './CartContext';
import { ChatProvider } from './ChatContext';
import { FavoritesProvider } from './FavoritesContext';
import { LocationProvider } from './LocationContext';
import { SellerProvider } from './SellerContext';

// Per-session app state. Must be rendered inside AuthProvider.
// Each provider resets itself on sign-in/sign-out (see useSessionState), so
// the cart, chats, favourites, seller type and location don't carry over.
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ChatProvider>
        <FavoritesProvider>
          <SellerProvider>
            <LocationProvider>{children}</LocationProvider>
          </SellerProvider>
        </FavoritesProvider>
      </ChatProvider>
    </CartProvider>
  );
}

export default AppProviders;
