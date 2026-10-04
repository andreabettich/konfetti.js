---
"@konfetti-js/core": minor
---

Confetti now behaves like paper. Each piece tumbles in 3D around three axes and is shaded by a light from the upper left, so it flashes lighter and darker as it turns. Air resistance slows the burst quickly, then pieces sway down slowly like falling leaves and disappear once they leave the screen instead of fading out in mid-air. The previous flat look and physics are gone.

Option changes that come with it:

- `ticks` is now the longest a piece may live and defaults to 600 (10 seconds); pieces usually leave the screen first.
- `drift` is now wind: the air moves sideways and carries the pieces with it.
- `decay` is the air resistance; `gravity` still scales how fast pieces fall.
