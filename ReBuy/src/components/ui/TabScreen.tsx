import type { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Root view for tab screens, padded for the top and side safe areas (the
// tab bar already covers the bottom). Uses the provider's insets rather
// than the native SafeAreaView: a tab that hasn't been shown yet sits off
// screen, where SafeAreaView measures zero insets, so on its first visit
// the content drew under the status bar and then jumped down.
function TabScreen({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        style,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {children}
    </View>
  );
}

export default TabScreen;
