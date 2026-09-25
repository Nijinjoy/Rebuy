import { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { CartProvider } from './CartContext';
import { ChatProvider } from './ChatContext';
import { FavoritesProvider } from './FavoritesContext';
import { LocationProvider } from './LocationContext';
import { SellerProvider } from './SellerContext';

// Per-session app state. Must be rendered inside AuthProvider.
// Keyed on isSignedIn so the cart, chats, favourites, seller type and
// location reset when the user signs out.
function AppProviders({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const sessionKey = isSignedIn ? 'signed-in' : 'signed-out';

  return (
    <CartProvider key={sessionKey}>
      <ChatProvider key={sessionKey}>
        <FavoritesProvider key={sessionKey}>
          <SellerProvider key={sessionKey}>
            <LocationProvider key={sessionKey}>{children}</LocationProvider>
          </SellerProvider>
        </FavoritesProvider>
      </ChatProvider>
    </CartProvider>
  );
}

export default AppProviders;
