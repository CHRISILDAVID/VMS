import { useLocalSearchParams } from 'expo-router';
import { HostedMatchDetailScreen } from '../../../features/social/HostedMatchDetailScreen';

export default function MatchDetailRoute() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <HostedMatchDetailScreen matchId={matchId} />;
}
