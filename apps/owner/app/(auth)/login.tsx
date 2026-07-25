import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginForm } from '../../features/auth/components/LoginForm';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E3A8A', '#0F172A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
