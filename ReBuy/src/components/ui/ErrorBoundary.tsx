import { Component, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import EmptyState from './EmptyState';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Catches render errors so one broken screen doesn't close the app.
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Send to a crash reporter (e.g. Sentry) once one is set up.
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <View style={styles.screen}>
        <EmptyState
          icon="help"
          title="Something went wrong"
          text="Please try again. If it keeps happening, restart the app."
          actionTitle="Try again"
          onAction={() => this.setState({ hasError: false })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
});

export default ErrorBoundary;
