import { useLocalSearchParams } from 'expo-router';
import { PublicPlayerProfileScreen } from '../../../features/social/PublicPlayerProfileScreen';

export default function PlayerProfileRoute() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  return <PublicPlayerProfileScreen playerId={playerId} />;
}
