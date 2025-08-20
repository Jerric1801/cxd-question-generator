/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // no public key needed on client
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}