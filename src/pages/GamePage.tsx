import { useEnergyTick } from '../hooks/useEnergyTick';
import { useAutoSave } from '../hooks/useAutoSave';
import { Board } from '../components/board/Board';
import { CreateButton } from '../components/controls/CreateButton';
import { SellButton } from '../components/controls/SellButton';

export function GamePage(): JSX.Element {
  useEnergyTick();
  useAutoSave();

  return (
    <div
      className="flex flex-col items-center px-3 pt-2"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Board />
        <div className="flex flex-col gap-2">
          <SellButton />
          <CreateButton />
        </div>
      </div>
    </div>
  );
}
