import type { ComponentType } from 'react';

// The drawings are a chunk of their own, so they don't hold up the facade. Without them the fact can still be read.
const none = () => null;

export const loadDrawings = (): Promise<{ default: ComponentType<{ day: number }> }> => import('./index').catch(() => ({ default: none }));
