import { useState, useCallback, useRef } from 'react';

// Generic undo/redo over a serializable value. `set` records history;
// `reset` replaces without recording (used when switching/loading projects).
export function useHistory(initial, limit = 100) {
  const [stacks, setStacks] = useState({ past: [], present: initial, future: [] });
  const presentRef = useRef(initial);
  presentRef.current = stacks.present;

  const set = useCallback((updater) => {
    setStacks((h) => {
      const next = typeof updater === 'function' ? updater(h.present) : updater;
      if (JSON.stringify(next) === JSON.stringify(h.present)) return h;
      const past = [...h.past, h.present];
      if (past.length > limit) past.shift();
      return { past, present: next, future: [] };
    });
  }, [limit]);

  const undo = useCallback(() => {
    setStacks((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    });
  }, []);

  const redo = useCallback(() => {
    setStacks((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      return { past: [...h.past, h.present], present: next, future: h.future.slice(1) };
    });
  }, []);

  const reset = useCallback((value) => {
    setStacks({ past: [], present: value, future: [] });
  }, []);

  return [
    stacks.present,
    set,
    { undo, redo, reset, canUndo: stacks.past.length > 0, canRedo: stacks.future.length > 0, getPresent: () => presentRef.current },
  ];
}
