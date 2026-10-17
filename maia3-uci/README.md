# Maia 3 UCI engine launcher

Runs [Maia 3](https://github.com/CSSLab/maia3) — the human-like chess model
from the University of Toronto CSSLab, conditioned on player rating — as a
UCI engine in En Croissant.

Maia 3 is a Python package (PyTorch; not published on PyPI) and its three
model presets (`maia3-5m`, `maia3-23m`, `maia3-79m`) already speak UCI, so
these scripts only manage the Python environment:

- `maia3` — shared launcher. On first use it creates a Python 3.10+ virtual
  environment next to itself (via `uv` if available, otherwise `python3 -m
  venv`), installs the package from a **pinned GitHub snapshot**, pre-caches
  the model weights, and then runs the package's own entry point. While it
  sets up it prints a static UCI banner so engine configuration is instant;
  a lock plus a readiness marker make concurrent or interrupted setups safe.
  Once the weights are cached it sets `HF_HUB_OFFLINE=1` so startup skips
  network revision checks (~0.7 s for a full uci→go→bestmove session).
- `maia3-5m`, `maia3-23m`, `maia3-79m` — one-line wrappers selecting the
  model (21 MB / 92 MB / 316 MB checkpoints; 5M answers in ~20 ms per
  position, 79M in ~90 ms on an M-series CPU).

The engine catalog installs a wrapper plus the shared launcher per model.

## UCI options (from the package)

| Option                | Meaning                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `Elo`                 | rating the model imitates (sets both of the below); default 1500 |
| `SelfElo` / `OppoElo` | rating of the side to move / its opponent                        |
| `Temperature`         | sampling temperature; presets use `0` (deterministic argmax)     |
| `TopP`                | nucleus sampling cutoff                                          |
| `MultiPV`             | number of human candidate moves reported (1–20)                  |

`go` performs a single forward pass and ignores depth/time limits; `go
infinite` waits for `stop`. Evaluations are the model's expected score.

## Notes

- First run downloads PyTorch (~600 MB) into the local environment and the
  chosen checkpoint into `~/.cache/huggingface`; everything after is offline.
- The catalog entries point at these files on the repository's default branch
  and so activate once this change is merged. Until then, add
  `maia3-uci/maia3-23m` through Engines → Add New → Local.
- POSIX shell only (macOS and Linux); a Windows launcher is a follow-up.
