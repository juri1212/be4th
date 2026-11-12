# Garage loading

How much the garage page downloads and how long it takes until the sequence starts playing, measured with `npm run measure` after each change to how it loads. "Sequence starts" is the first frame drawn with the sequence playing, counted from the start of navigation. The columns after "First paint" are the stages `src/garage/scene.ts` marks on the way there.

## Baseline

| Profile | Sequence starts | Received by then | Received in total | Requests | First paint | `code` | `car` | `built` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | **0.75 s** | **2,911 kB** | 2,911 kB | 17 | 0.08 s | 0.08 s | 0.37 s | 0.62 s |
| Phone on 4G | **5.90 s** | **2,809 kB** | 2,911 kB | 17 | 0.47 s | 0.94 s | 4.66 s | 5.68 s |

Received in total, by kind: page 4 kB, styles 8 kB, scripts 252 kB, fonts 192 kB, model 2,454 kB, other 1 kB.

Median of 5 cold loads per profile; Desktop: no throttling, 1440 × 900; Phone on 4G: 9 Mbit/s down, 165 ms latency, 4× slower CPU, 390 × 844. Drawn by ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version).

## Rays binned before they are cast

| Profile | Sequence starts | Received by then | Received in total | Requests | First paint | `code` | `car` | `built` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | **0.36 s** | **2,911 kB** | 2,911 kB | 17 | 0.08 s | 0.08 s | 0.17 s | 0.24 s |
| Phone on 4G | **4.32 s** | **2,809 kB** | 2,911 kB | 17 | 0.47 s | 0.95 s | 3.84 s | 4.09 s |

Received in total, by kind: page 4 kB, styles 8 kB, scripts 252 kB, fonts 192 kB, model 2,454 kB, other 1 kB.

Median of 5 cold loads per profile; Desktop: no throttling, 1440 × 900; Phone on 4G: 9 Mbit/s down, 165 ms latency, 4× slower CPU, 390 × 844. Drawn by ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version).

## One wheel for all four corners, smaller normals and positions

| Profile | Sequence starts | Received by then | Received in total | Requests | First paint | `code` | `car` | `built` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | **0.34 s** | **1,808 kB** | 1,808 kB | 17 | 0.08 s | 0.08 s | 0.15 s | 0.22 s |
| Phone on 4G | **3.15 s** | **1,706 kB** | 1,808 kB | 17 | 0.46 s | 0.94 s | 2.70 s | 2.93 s |

Received in total, by kind: page 4 kB, styles 8 kB, scripts 252 kB, fonts 192 kB, model 1,350 kB, other 1 kB.

Median of 5 cold loads per profile; Desktop: no throttling, 1440 × 900; Phone on 4G: 9 Mbit/s down, 165 ms latency, 4× slower CPU, 390 × 844. Drawn by ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version).

## Car and scene code fetched with the page, bike built meanwhile

| Profile | Sequence starts | Received by then | Received in total | Requests | First paint | `code` | `bike` | `car` | `built` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | **0.33 s** | **1,808 kB** | 1,808 kB | 18 | 0.08 s | 0.06 s | 0.15 s | 0.19 s | 0.20 s |
| Phone on 4G | **2.52 s** | **1,808 kB** | 1,808 kB | 18 | 0.62 s | 1.16 s | 1.47 s | 2.28 s | 2.32 s |

Received in total, by kind: page 4 kB, styles 8 kB, scripts 252 kB, fonts 192 kB, model 1,350 kB, other 1 kB.

Median of 5 cold loads per profile; Desktop: no throttling, 1440 × 900; Phone on 4G: 9 Mbit/s down, 165 ms latency, 4× slower CPU, 390 × 844. Drawn by ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version).

