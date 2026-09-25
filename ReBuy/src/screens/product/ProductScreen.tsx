import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useChats } from '../../context/ChatContext';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import PhotoGallery from '../../components/product/PhotoGallery';
import StarRating from '../../components/ui/StarRating';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useListing } from '../../hooks/useListings';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

type Props = RootStackScreenProps<'Product'>;

const MAX_IMAGE = 480;

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ProductScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const { isInCart, addItem } = useCart();
  const { startChat } = useChats();
  const { data: product, error, refetch } = useListing(route.params.productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.statusHeader}>
          <ScreenHeader title="" onBack={() => navigation.goBack()} />
        </View>
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <LoadingState />
        )}
      </SafeAreaView>
    );
  }

  const inCart = isInCart(product.id);

  const handleCart = () => {
    if (inCart) {
      navigation.navigate('App', {
        screen: 'Tabs',
        params: { screen: 'Cart' },
      });
    } else {
      addItem(product);
    }
  };

  const handleChat = () => {
    navigation.navigate('Chat', { chatId: startChat(product) });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PhotoGallery
          title={product.title}
          images={product.images}
          width={width}
          height={Math.min(width, MAX_IMAGE)}
        />

        <View style={styles.body}>
          <Text style={styles.title} accessibilityRole="header">
            {product.title}
          </Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.meta}>
            {product.location} · Posted {product.postedAt}
          </Text>

          <View style={styles.details}>
            <Detail label="Condition" value={product.condition} />
            <Detail label="Category" value={product.category} />
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.seller}>
            <Avatar name={product.sellerName} size={48} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.sellerName}</Text>
              <View style={styles.rating}>
                <StarRating rating={product.sellerRating} />
                <Text style={styles.ratingValue}>
                  {product.sellerRating.toFixed(1)}
                </Text>
                <Text style={styles.ratingCount}>
                  ({product.sellerReviewCount}{' '}
                  {product.sellerReviewCount === 1 ? 'review' : 'reviews'})
                </Text>
              </View>
              <Text style={styles.meta}>{product.location}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floats over the photo so it stays reachable while scrolling. */}
      <SafeAreaView
        edges={['top']}
        style={styles.topBar}
        pointerEvents="box-none"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Icon name="back" color={colors.textPrimary} size={22} />
        </Pressable>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Chat with ${product.sellerName}`}
          onPress={handleChat}
          style={({ pressed }) => [styles.chat, pressed && styles.pressed]}
        >
          <Icon name="chats" color={colors.textPrimary} size={20} />
          <Text style={styles.chatText}>Chat</Text>
        </Pressable>
        <Button
          title={inCart ? 'View in cart' : 'Add to cart'}
          variant={inCart ? 'outline' : 'primary'}
          onPress={handleCart}
          style={styles.cartButton}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
  },
  statusHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  price: {
    marginTop: 6,
    fontFamily: fonts.label,
    fontSize: 18,
    color: colors.accent,
  },
  meta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  detail: {
    flex: 1,
    padding: 12,
    gap: 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  detailLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sellerInfo: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingValue: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  ratingCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  sellerName: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  chat: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chatText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cartButton: {
    flex: 1,
  },
});

export default ProductScreen;
