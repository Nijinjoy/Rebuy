import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TabScreen from '../../components/ui/TabScreen';
import { CartItem, useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Icon, { IconName } from '../../components/ui/Icon';
import ProductThumb from '../../components/product/ProductThumb';
import ScreenHeader from '../../components/ui/ScreenHeader';
import type { TabScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

type Props = TabScreenProps<'Cart'>;

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

function IconButton({ icon, label, onPress }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Icon name={icon} color={colors.textPrimary} size={16} />
    </Pressable>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const { setQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <View style={styles.row}>
      <ProductThumb title={product.title} uri={product.images[0]} size={56} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.meta}>{product.condition}</Text>
        <Text style={styles.price}>
          {formatPrice(product.price * quantity)}
        </Text>
      </View>
      <View style={styles.controls}>
        <IconButton
          icon="trash"
          label={`Remove ${product.title}`}
          onPress={() => removeItem(product.id)}
        />
        <View style={styles.stepper}>
          <IconButton
            icon="minus"
            label="Decrease quantity"
            onPress={() => setQuantity(product.id, quantity - 1)}
          />
          <Text
            style={styles.quantity}
            accessibilityLabel={`Quantity ${quantity}`}
          >
            {quantity}
          </Text>
          <IconButton
            icon="plus"
            label="Increase quantity"
            onPress={() => setQuantity(product.id, quantity + 1)}
          />
        </View>
      </View>
    </View>
  );
}

function CartScreen({ navigation }: Props) {
  const { items, count, subtotal, clear } = useCart();

  const handleCheckout = () => {
    // Placeholder until checkout and payments are built.
    Alert.alert('Checkout', 'Checkout is coming soon.');
  };

  const handleClear = () => {
    Alert.alert('Clear cart?', 'This removes all items from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clear },
    ]);
  };

  // The tab bar already covers the bottom safe area.
  return (
    <TabScreen style={styles.screen}>
      <View style={styles.header}>
        <ScreenHeader title="Cart" pill />
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="cart" color={colors.placeholder} size={48} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Items you add will appear here.</Text>
          <Button
            title="Browse items"
            onPress={() => navigation.navigate('Explore')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.product.id}
            renderItem={({ item }) => <CartRow item={item} />}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.meta}>
                  {count} item{count === 1 ? '' : 's'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleClear}
                >
                  <Text style={styles.clear}>Clear cart</Text>
                </Pressable>
              </View>
            }
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Button title="Checkout" onPress={handleCheckout} />
          </View>
        </>
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    padding: 24,
    gap: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clear: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    marginTop: 4,
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary,
  },
  controls: {
    alignItems: 'flex-end',
    gap: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.6,
  },
  quantity: {
    minWidth: 18,
    textAlign: 'center',
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyButton: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});

export default CartScreen;
