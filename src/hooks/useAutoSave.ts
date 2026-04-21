import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { debouncedSave } from '../store/persistence';

export function useAutoSave(): void {
  useEffect(() => {
    return useGameStore.subscribe((state) => {
      debouncedSave({
        v: 1,
        board: state.board,
        player: state.player,
        meta: state.meta,
      });
    });
  }, []);
}
