import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { AlertCircle, LogOut } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function AccountNotConfiguredScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center mb-6">
          <AlertCircle size={40} color="#f97316" />
        </View>

        <Text className="text-2xl font-bold text-slate-900 text-center mb-3">
          Account Not Configured
        </Text>
        
        <Text className="text-base text-slate-500 text-center mb-10 leading-relaxed px-4">
          Your account hasn't been set up yet. Please contact the administrator to configure your account.
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          className="w-full max-w-sm bg-slate-900 py-4 rounded-xl flex-row items-center justify-center"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
        >
          <LogOut size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-base">
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
