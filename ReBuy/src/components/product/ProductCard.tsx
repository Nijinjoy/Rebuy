import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types/listing';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';
import Icon from '../ui/Icon';
import ProductThumb from './ProductThumb';

type ProductCardProps = {
  product: Product;
  width: number;
  onPress: () => void;
  // Hide the Add to cart button, e.g. in compact carousels.
  hideAddButton?: boolean;
};

// Listing tile with photo, price, title and an Add to cart button.
function ProductCard({
  product,
  width,
  onPress,
  hideAddButton = false,
}: ProductCardProps) {
  const { isInCart, addItem } = useCart();
  const inCart = isInCart(product.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPrice(product.price)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.cardPressed,
      ]}
    >
      <ProductThumb
        title={product.title}
        uri={product.images[0]}
        size={width - 2}
      />
      <View style={styles.cardBody}>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {product.condition} · {product.location}
        </Text>
        {!hideAddButton && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              inCart
                ? `${product.title} is in your cart`
                : `Add ${product.title} to cart`
            }
            accessibilityState={{ disabled: inCart }}
            disabled={inCart}
            onPress={() => addItem(product)}
            style={({ pressed }) => [
              styles.add,
              inCart && styles.addDone,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name={inCart ? 'cart' : 'plus'}
              color={inCart ? colors.textPrimary : colors.onPrimary}
              size={14}
            />
            <Text style={[styles.addText, inCart && styles.addTextDone]}>
              {inCart ? 'In cart' : 'Add to cart'}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardBody: {
    flex: 1,
    padding: 10,
    gap: 2,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textPrimary,
  },
  title: {
    minHeight: 34,
    fontFamily: fonts.label,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  add: {
    marginTop: 8,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  addDone: {
    backgroundColor: colors.accentSoft,
  },
  addText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.onPrimary,
  },
  addTextDone: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default ProductCard;
