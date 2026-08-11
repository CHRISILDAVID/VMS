import { View } from 'react-native';
import { CreateProfileForm } from '../../features/auth/components/CreateProfileForm';

/**
 * Profile creation screen shown on first login.
 * User must complete this before accessing the main app tabs.
 * AuthGuard redirects to /(tabs)/home once playerProfile is set.
 */
export default function CreateProfileScreen() {
  return (
    <View className="flex-1 bg-background">
      <CreateProfileForm />
    </View>
  );
}
