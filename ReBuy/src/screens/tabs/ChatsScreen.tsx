import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import ProductThumb from '../../components/product/ProductThumb';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useChats } from '../../context/ChatContext';
import type { Chat } from '../../types/chat';
import type { TabScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

const FILTERS = ['All', 'Buying', 'Selling', 'Unread'] as const;
type Filter = (typeof FILTERS)[number];

function matchesFilter(chat: Chat, filter: Filter) {
  switch (filter) {
    case 'Buying':
      return chat.role === 'buying';
    case 'Selling':
      return chat.role === 'selling';
    case 'Unread':
      return chat.unread > 0;
    default:
      return true;
  }
}

function ChatRow({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  const unread = chat.unread > 0;
  const last = chat.messages[chat.messages.length - 1];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${chat.name} about ${chat.productTitle}${
        unread ? `, ${chat.unread} unread` : ''
      }`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View>
        <Avatar name={chat.name} size={52} />
        <View style={styles.thumb}>
          <ProductThumb
            title={chat.productTitle}
            uri={chat.productImage}
            size={22}
          />
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>
            {last?.time}
          </Text>
        </View>
        <Text style={styles.product} numberOfLines={1}>
          {chat.productTitle}
        </Text>
        <View style={styles.bottomLine}>
          <Text
            style={[styles.message, unread && styles.messageUnread]}
            numberOfLines={1}
          >
            {last
              ? `${last.fromMe ? 'You: ' : ''}${
                  last.text || (last.image ? '📷 Photo' : '')
                }`
              : ''}
          </Text>
          {unread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {chat.unread > 9 ? '9+' : chat.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function ChatsScreen({ navigation }: TabScreenProps<'Chats'>) {
  const { chats } = useChats();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chats.filter(
      chat =>
        // Chats opened from a product stay hidden until a message is sent.
        chat.messages.length > 0 &&
        matchesFilter(chat, filter) &&
        (!q ||
          chat.name.toLowerCase().includes(q) ||
          chat.productTitle.toLowerCase().includes(q)),
    );
  }, [chats, query, filter]);

  // The tab bar already covers the bottom safe area.
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <ScreenHeader title="Chats" />
        <View style={styles.search}>
          <Icon name="explore" color={colors.placeholder} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or item"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search chats"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.filters} accessibilityRole="tablist">
          {FILTERS.map(f => {
            const selected = f === filter;
            return (
              <Pressable
                key={f}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setFilter(f)}
                style={({ pressed }) => [
                  styles.filter,
                  selected && styles.filterSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FlatList
        data={visible}
        keyExtractor={chat => chat.id}
        renderItem={({ item }) => (
          <ChatRow
            chat={item}
            onPress={() => navigation.navigate('Chat', { chatId: item.id })}
          />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="chats" color={colors.placeholder} size={48} />
            <Text style={styles.emptyTitle}>
              {query || filter !== 'All' ? 'No matching chats' : 'No chats yet'}
            </Text>
            <Text style={styles.emptyText}>
              {query || filter !== 'All'
                ? 'Try a different search or filter.'
                : 'Message a seller about an item to start a chat.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
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
    gap: 16,
  },
  search: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  filterTextSelected: {
    color: colors.onPrimary,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  thumb: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    padding: 2,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeUnread: {
    fontFamily: fonts.label,
    color: colors.accent,
  },
  product: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.accent,
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  messageUnread: {
    fontFamily: fonts.bodyMedium,
    color: colors.textPrimary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  badgeText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.primary,
  },
  separator: {
    height: 1,
    marginLeft: 66,
    backgroundColor: colors.border,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});

export default ChatsScreen;
