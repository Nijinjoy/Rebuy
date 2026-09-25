import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import Button from './Button';
import Icon, { IconName } from './Icon';

type Props = {
  icon: IconName;
  title: string;
  text: string;
  actionTitle?: string;
  onAction?: () => void;
};

// Centered message for lists with nothing in them yet.
function EmptyState({ icon, title, text, actionTitle, onAction }: Props) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} color={colors.placeholder} size={48} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {!!actionTitle && (
        <Button title={actionTitle} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  title: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});

export default EmptyState;
