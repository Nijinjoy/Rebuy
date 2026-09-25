import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

// Centered spinner for screens waiting on data.
function LoadingState() {
  return (
    <View style={styles.loading} accessibilityLabel="Loading">
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});

export default LoadingState;
