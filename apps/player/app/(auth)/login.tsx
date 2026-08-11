import { View } from 'react-native';
import { LoginForm } from '../../features/auth/components/LoginForm';

/**
 * Login screen — Navy gradient background with the LoginForm component.
 * AuthGuard in _layout.tsx redirects away from here on successful auth.
 */
export default function LoginScreen() {
  return (
    <View className="flex-1 bg-background">
      <LoginForm />
    </View>
  );
}
