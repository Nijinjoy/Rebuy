import ReactTestRenderer from 'react-test-renderer';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider, useCart } from '../src/context/CartContext';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';

const [phone, headphones] = SAMPLE_PRODUCTS;

function renderCart() {
  const ref: { current: ReturnType<typeof useCart> | null } = { current: null };
  function Probe() {
    ref.current = useCart();
    return null;
  }
  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <AuthProvider>
        <CartProvider>
          <Probe />
        </CartProvider>
      </AuthProvider>,
    );
  });
  return () => ref.current!;
}

test('adds items and increments quantity for repeats', () => {
  const cart = renderCart();
  ReactTestRenderer.act(() => cart().addItem(phone));
  ReactTestRenderer.act(() => cart().addItem(phone));
  ReactTestRenderer.act(() => cart().addItem(headphones));

  expect(cart().items).toHaveLength(2);
  expect(cart().count).toBe(3);
  expect(cart().subtotal).toBe(phone.price * 2 + headphones.price);
  expect(cart().isInCart(phone.id)).toBe(true);
});

test('setting quantity below 1 removes the item', () => {
  const cart = renderCart();
  ReactTestRenderer.act(() => cart().addItem(phone));
  ReactTestRenderer.act(() => cart().setQuantity(phone.id, 3));
  expect(cart().count).toBe(3);

  ReactTestRenderer.act(() => cart().setQuantity(phone.id, 0));
  expect(cart().items).toHaveLength(0);
  expect(cart().subtotal).toBe(0);
});

test('removeItem and clear', () => {
  const cart = renderCart();
  ReactTestRenderer.act(() => cart().addItem(phone));
  ReactTestRenderer.act(() => cart().addItem(headphones));
  ReactTestRenderer.act(() => cart().removeItem(phone.id));
  expect(cart().items.map(i => i.product.id)).toEqual([headphones.id]);

  ReactTestRenderer.act(() => cart().clear());
  expect(cart().count).toBe(0);
});
