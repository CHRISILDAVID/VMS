import { useState } from 'react'
import type { Category } from './data'
import S1Dashboard from './screens/S1Dashboard'
import S2TeamEntry from './screens/S2TeamEntry'
import S3PoolGeneration from './screens/S3PoolGeneration'
import S4ReviewPools from './screens/S4ReviewPools'
import S5LeagueDashboard from './screens/S5LeagueDashboard'
import S6GenerateKnockout from './screens/S6GenerateKnockout'
import S7ReviewKnockout from './screens/S7ReviewKnockout'
import S8KnockoutDashboard from './screens/S8KnockoutDashboard'
import S9Finals from './screens/S9Finals'
import S10Champion from './screens/S10Champion'

export type Screen =
  | 'dashboard' | 'team-entry' | 'pool-generation'
  | 'review-pools' | 'league' | 'generate-knockout'
  | 'review-knockout' | 'knockout-dashboard' | 'finals' | 'champion'

export interface ScreenProps {
  nav: (s: Screen) => void
  category: Category
  setCategory: (c: Category) => void
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [category, setCategory] = useState<Category>("Men's")

  const nav = (s: Screen) => setScreen(s)
  const props: ScreenProps = { nav, category, setCategory }

  return (
    <div style={{ background: '#EEF2F8', minHeight: '100dvh' }}>
      {screen === 'dashboard'          && <S1Dashboard {...props} />}
      {screen === 'team-entry'         && <S2TeamEntry {...props} />}
      {screen === 'pool-generation'    && <S3PoolGeneration {...props} />}
      {screen === 'review-pools'       && <S4ReviewPools {...props} />}
      {screen === 'league'             && <S5LeagueDashboard {...props} />}
      {screen === 'generate-knockout'  && <S6GenerateKnockout {...props} />}
      {screen === 'review-knockout'    && <S7ReviewKnockout {...props} />}
      {screen === 'knockout-dashboard' && <S8KnockoutDashboard {...props} />}
      {screen === 'finals'             && <S9Finals {...props} />}
      {screen === 'champion'           && <S10Champion {...props} />}
    </div>
  )
}
