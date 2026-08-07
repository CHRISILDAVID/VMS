import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginForm } from '../../features/auth/components/LoginForm';

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#0F172A', '#1E3A8A', '#0F172A']}
        className="absolute inset-0"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LoginForm />
    </View>
  );
}
