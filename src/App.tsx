import { useState } from 'react';
import { TopHud } from './components/layout/TopHud';
import { TabBar, type TabId } from './components/layout/TabBar';
import { ToastContainer } from './components/common/Toast';
import { RouletteModal } from './components/roulette/RouletteModal';
import { LevelUpOverlay } from './components/levelup/LevelUpOverlay';
import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay';
import { GamePage } from './pages/GamePage';
import { CollectionPage } from './pages/CollectionPage';
import { ProfilePage } from './pages/ProfilePage';
import { useTelegramBackButton } from './hooks/useTelegramBackButton';

const TAB_HEIGHT = 56; // min-h-14 = 56px

export function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('game');

  useTelegramBackButton(activeTab !== 'game', () => setActiveTab('game'));

  return (
    <div className="min-h-screen bg-boxly-bg flex flex-col">
      <TopHud />

      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: TAB_HEIGHT }}
      >
        {activeTab === 'game' ? <GamePage /> : null}
        {activeTab === 'collection' ? <CollectionPage /> : null}
        {activeTab === 'profile' ? <ProfilePage /> : null}
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
      <ToastContainer />
      <RouletteModal />
      <LevelUpOverlay />
      <OnboardingOverlay />
    </div>
  );
}
