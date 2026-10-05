import { ReactNode } from 'react';
import { CartProvider } from './CartContext';
import { ChatProvider } from './ChatContext';
import { FavoritesProvider } from './FavoritesContext';
import { LocationProvider } from './LocationContext';

// Per-session app state. Must be rendered inside AuthProvider.
// Each provider resets itself on sign-in/sign-out (see useSessionState), so
// the cart, chats, favourites and location don't carry over.
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ChatProvider>
        <FavoritesProvider>
          <LocationProvider>{children}</LocationProvider>
        </FavoritesProvider>
      </ChatProvider>
    </CartProvider>
  );
}

export default AppProviders;
