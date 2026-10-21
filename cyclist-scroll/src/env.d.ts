/// <reference types="vite/client" />

import type { Post, PostMeta } from './types';

declare global {
  // Set in vite.config.ts from the last commit.
  const __BUILD__: { commit: string; date: string };
}

// Built by plugins/markdown.ts.
declare module '*.md' {
  const post: Post;
  export default post;
}

declare module '*.md?meta' {
  const meta: PostMeta;
  export default meta;
}
