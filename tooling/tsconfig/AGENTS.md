# TSConfig Package Agent Instructions

These rules apply to `tooling/tsconfig`.

## Purpose

`tooling/tsconfig` owns shared TypeScript configuration files for workspace apps and packages.

## Rules

- Keep configs composable and narrowly named by runtime or package type.
- Do not loosen strictness globally to fix a local type error. Fix the local type issue or add a
  scoped override where justified.
- Do not add framework-specific settings to the base config unless every consumer needs them.
- Update this package's README when adding, renaming, or removing shared configs.
