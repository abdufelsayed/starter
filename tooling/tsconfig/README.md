# @starter/tsconfig

Shared TypeScript configurations.

This README is explanatory. The strict implementation contract for agents is
[`tooling/tsconfig/AGENTS.md`](./AGENTS.md).

## Configs

| Config                | Use case                                            |
| --------------------- | --------------------------------------------------- |
| `base.json`           | Strict base config                                  |
| `react-library.json`  | React packages                                      |
| `node-jsx.json`       | Node.js packages that consume TSX source            |
| `react-node.json`     | React packages with Node.js runtime helpers         |
| `tanstack-start.json` | TanStack Start apps                                 |
| `library.json`        | Browser-capable packages                            |
| `node.json`           | Node.js packages using workspace bundler resolution |

## Usage

```json
{
  "extends": "@starter/tsconfig/base.json"
}
```
