import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { showAlert } from '../../components/ui/AlertProvider';
import {
  Asset,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChats } from '../../context/ChatContext';
import Avatar from '../../components/ui/Avatar';
import Icon from '../../components/ui/Icon';
import ProductThumb from '../../components/product/ProductThumb';
import type { Message, MessageImage } from '../../types/chat';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts, palette, withAlpha } from '../../theme';

type Props = RootStackScreenProps<'Chat'>;

const PHOTO_WIDTH = 220;

const pickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1600,
};

function toImage(asset: Asset | undefined): MessageImage | null {
  if (!asset?.uri) {
    return null;
  }
  return {
    uri: asset.uri,
    width: asset.width || 1,
    height: asset.height || 1,
  };
}

// Clamps tall photos so one message can't fill the whole screen.
function photoSize(image: MessageImage) {
  const height = Math.min(
    (PHOTO_WIDTH * image.height) / image.width,
    PHOTO_WIDTH * 1.4,
  );
  return { width: PHOTO_WIDTH, height };
}

type BubbleProps = {
  message: Message;
  onOpenImage: (image: MessageImage) => void;
};

function Bubble({ message, onOpenImage }: BubbleProps) {
  const mine = message.fromMe;
  const { image } = message;

  return (
    <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      <View
        style={[
          styles.bubble,
          mine ? styles.bubbleMine : styles.bubbleTheirs,
          !!image && styles.bubbleWithImage,
        ]}
      >
        {image && (
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel="Open photo"
            onPress={() => onOpenImage(image)}
          >
            <Image
              source={{ uri: image.uri }}
              style={[styles.photo, photoSize(image)]}
              resizeMode="cover"
            />
          </Pressable>
        )}
        {!!message.text && (
          <Text
            style={[
              styles.bubbleText,
              mine && styles.bubbleTextMine,
              !!image && styles.caption,
            ]}
          >
            {message.text}
          </Text>
        )}
        <Text
          style={[
            styles.bubbleTime,
            mine && styles.bubbleTimeMine,
            !!image && styles.caption,
          ]}
        >
          {message.time}
        </Text>
      </View>
    </View>
  );
}

function ChatScreen({ navigation, route }: Props) {
  const { chatId } = route.params;
  const { getChat, markRead, sendMessage } = useChats();
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState<MessageImage | null>(null);
  const [viewing, setViewing] = useState<MessageImage | null>(null);
  const chat = getChat(chatId);
  const unread = chat?.unread ?? 0;

  // Opening the conversation reads any new messages.
  useEffect(() => {
    if (unread > 0) {
      markRead(chatId);
    }
  }, [chatId, unread, markRead]);

  if (!chat) {
    return null;
  }

  const handlePicked = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    const image = toImage(response.assets?.[0]);
    if (response.errorCode || !image) {
      showAlert(
        "Couldn't attach photo",
        response.errorCode === 'camera_unavailable'
          ? 'No camera is available on this device.'
          : response.errorCode === 'permission'
          ? 'Allow ReBuy to access your photos in Settings.'
          : 'Please try again.',
      );
      return;
    }
    setAttachment(image);
  };

  // Rejects when the native picker is missing, e.g. an app build from
  // before react-native-image-picker was installed.
  const pick = (launch: () => Promise<ImagePickerResponse>) => {
    launch()
      .then(handlePicked)
      .catch(() =>
        showAlert(
          "Couldn't open photos",
          'The photo picker is not available in this build of the app.',
        ),
      );
  };

  const handleAttach = () => {
    showAlert('Send a photo', undefined, [
      {
        text: 'Take photo',
        onPress: () =>
          pick(() => launchCamera({ ...pickerOptions, saveToPhotos: false })),
      },
      {
        text: 'Choose from library',
        onPress: () => pick(() => launchImageLibrary(pickerOptions)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSend = () => {
    sendMessage(chat.id, { text: draft, image: attachment ?? undefined });
    setDraft('');
    setAttachment(null);
  };

  const canSend = draft.trim().length > 0 || !!attachment;

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Icon name="back" color={colors.textPrimary} size={22} />
        </Pressable>
        <Avatar name={chat.name} size={40} />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={styles.role}>
            {chat.role === 'buying' ? 'Seller' : 'Buyer'}
          </Text>
        </View>
      </View>

      <View style={styles.product}>
        <ProductThumb
          title={chat.productTitle}
          uri={chat.productImage}
          size={40}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {chat.productTitle}
          </Text>
          <Text style={styles.productMeta}>
            {chat.role === 'buying' ? "You're buying" : "You're selling"}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {/* Inverted so the list starts at the newest message. */}
        <FlatList
          inverted
          data={[...chat.messages].reverse()}
          keyExtractor={message => message.id}
          renderItem={({ item }) => (
            <Bubble message={item} onOpenImage={setViewing} />
          )}
          contentContainerStyle={styles.messages}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />
        {attachment && (
          <View style={styles.attachment}>
            <Image
              source={{ uri: attachment.uri }}
              style={styles.attachmentImage}
              accessibilityLabel="Photo to send"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              hitSlop={8}
              onPress={() => setAttachment(null)}
              style={styles.attachmentRemove}
            >
              <Icon name="close" color={colors.onPrimary} size={14} />
            </Pressable>
          </View>
        )}
        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach a photo"
            hitSlop={6}
            onPress={handleAttach}
            style={({ pressed }) => [styles.attach, pressed && styles.pressed]}
          >
            <Icon name="image" color={colors.textPrimary} size={22} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder={attachment ? 'Add a caption…' : 'Write a message…'}
            placeholderTextColor={colors.placeholder}
            value={draft}
            onChangeText={setDraft}
            accessibilityLabel="Message"
            multiline
            maxLength={1000}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.send,
              !canSend && styles.sendDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Icon name="send" color={colors.onPrimary} size={20} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={!!viewing}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewing(null)}
      >
        <View style={styles.viewer}>
          {viewing && (
            <Image
              source={{ uri: viewing.uri }}
              style={styles.viewerImage}
              resizeMode="contain"
              accessibilityLabel="Photo"
            />
          )}
          <SafeAreaView style={styles.viewerBar} edges={['top']}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close photo"
              hitSlop={8}
              onPress={() => setViewing(null)}
              style={({ pressed }) => [
                styles.viewerClose,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="close" color={colors.onPrimary} size={22} />
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
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
  headerInfo: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textPrimary,
  },
  role: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  productMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.accent,
  },
  messages: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 18,
    gap: 2,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
    backgroundColor: colors.primary,
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bubbleWithImage: {
    padding: 4,
  },
  photo: {
    borderRadius: 14,
    backgroundColor: colors.backgroundAlt,
  },
  caption: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bubbleTextMine: {
    color: colors.onPrimary,
  },
  bubbleTime: {
    alignSelf: 'flex-end',
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  bubbleTimeMine: {
    color: colors.accent,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  attach: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  attachment: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  attachmentImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
  },
  attachmentRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  viewer: {
    flex: 1,
    backgroundColor: palette.ink,
  },
  viewerImage: {
    flex: 1,
  },
  viewerBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  viewerClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(palette.white, 0.15),
  },
});

export default ChatScreen;
