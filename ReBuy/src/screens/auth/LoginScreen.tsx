import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';
import { logo } from '../../assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { RootStackScreenProps } from '../../navigation/types';
import TextField from '../../components/ui/TextField';
import { colors, fonts } from '../../theme';

type Props = RootStackScreenProps<'Login'>;

// Placeholder until social sign-in exists.
const comingSoon = (feature: string) =>
  Alert.alert(feature, `${feature} is coming soon.`);

function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  const handleLogin = async () => {
    setFormError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      setFormError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brand}>
              <Image
                source={logo}
                style={styles.logo}
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.wordmark}>REBUY</Text>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to buy and sell pre-owned items.
              </Text>
            </View>

            <View style={styles.form}>
              {!!formError && (
                <Text style={styles.formError} accessibilityRole="alert">
                  {formError}
                </Text>
              )}

              <TextField
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />

              <TextField
                ref={passwordRef}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                password
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />

              <Pressable
                style={styles.forgot}
                accessibilityRole="link"
                hitSlop={8}
                onPress={() =>
                  navigation.navigate('ForgotPassword', { email: email.trim() })
                }
              >
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>

              <Button title="Sign in" onPress={handleLogin} loading={loading} />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.social}>
              <Button
                variant="outline"
                title="Continue with Google"
                onPress={() => comingSoon('Google sign-in')}
                disabled={loading}
              />
              {Platform.OS === 'ios' && (
                <Button
                  variant="outline"
                  title="Continue with Apple"
                  onPress={() => comingSoon('Apple sign-in')}
                  disabled={loading}
                />
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to ReBuy? </Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.link}>Create an account</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
    backgroundImage: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundAlt} 100%)`,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 5,
    color: colors.textPrimary,
  },
  header: {
    marginTop: 36,
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  formError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.error,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  link: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.accent,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  social: {
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 28,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default LoginScreen;
