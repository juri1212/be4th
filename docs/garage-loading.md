# Garage loading

How much the garage page downloads and how long it takes until the sequence starts playing, measured with `npm run measure` after each change to how it loads. "Sequence starts" is the first frame drawn with the sequence playing, counted from the start of navigation. The columns after "First paint" are the stages `src/garage/scene.ts` marks on the way there.
## Baseline

| Profile | Sequence starts | Received by then | Received in total | Requests | First paint | `code` | `car` | `built` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | **0.75 s** | **2,911 kB** | 2,911 kB | 17 | 0.08 s | 0.08 s | 0.37 s | 0.62 s |
| Phone on 4G | **5.90 s** | **2,809 kB** | 2,911 kB | 17 | 0.47 s | 0.94 s | 4.66 s | 5.68 s |

Received in total, by kind: page 4 kB, styles 8 kB, scripts 252 kB, fonts 192 kB, model 2,454 kB, other 1 kB.

Median of 5 cold loads per profile; Desktop: no throttling, 1440 × 900; Phone on 4G: 9 Mbit/s down, 165 ms latency, 4× slower CPU, 390 × 844. Drawn by ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version).

