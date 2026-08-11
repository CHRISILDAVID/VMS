import { View, Text, ScrollView } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

/**
 * Shop Tab — M14 will add: Product listing, cart, checkout (Razorpay/Wallet).
 */
export default function ShopScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader searchPlaceholder="Search products..." />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-extrabold text-foreground mb-1">Shop</Text>
        <Text className="text-muted-foreground text-sm mb-6">
          Rackets, shuttlecocks, shoes and more.
        </Text>

        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-foreground">Featured Products</Text>
            <Badge label="M14" variant="accent" />
          </View>
          <View className="h-40 bg-muted rounded-xl items-center justify-center">
            <Text className="text-4xl mb-2">🛍️</Text>
            <Text className="text-foreground font-semibold">Coming in Milestone 14</Text>
            <Text className="text-muted-foreground text-sm mt-1 text-center px-4">
              Browse products, add to cart, pay with wallet or Razorpay
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
