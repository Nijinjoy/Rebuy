import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../theme';
import ScreenHeader from './ScreenHeader';
import TabScreen from './TabScreen';

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
  onBack?: () => void;
};

// Temporary layout for screens that aren't built yet.
function ScreenPlaceholder({ title, description, children, onBack }: Props) {
  return (
    <TabScreen style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={title} onBack={onBack} />
        <Text style={styles.description}>{description}</Text>
        {children}
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  description: {
    marginTop: 16,
    marginBottom: 24,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});

export default ScreenPlaceholder;
