# @starter/tsconfig

Shared TypeScript configurations.

This README is explanatory. The strict implementation contract for agents is
[`tooling/tsconfig/AGENTS.md`](./AGENTS.md).

## Configs

| Config                | Use case            |
| --------------------- | ------------------- |
| `base.json`           | Strict base config  |
| `bun.json`            | Bun runtime         |
| `react-library.json`  | React packages      |
| `tanstack-start.json` | TanStack Start apps |
| `library.json`        | General packages    |
| `node.json`           | Node.js tooling     |

## Usage

```json
{
  "extends": "@starter/tsconfig/base.json"
}
```
