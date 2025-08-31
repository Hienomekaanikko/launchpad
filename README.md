So I have some music production background and a physical launchpad is rather familiar thing to me. So I wanted to practice some JS, html, css combination just 
to see how well can I adapt after being in the world of strictly C and C++ for such an intense period. 

So the plan is to have something like this:

<img width="931" height="666" alt="Screenshot 2025-08-31 at 13 24 55" src="https://github.com/user-attachments/assets/45c93f97-9d10-480c-896a-e07346fdfd26" />

- There are 5 rows of 5 sounds. Each row is it's own sound category such as drums, bass, rhythm, lead, athmospheric sounds. 

- Only one sound can play at once per row, but all rows can have one or none playing at the same time.

- The sounds must be in same key and tempo to mash beautifully together no matter what kind of mix you make.

Main challenges:

- Syncing the tracks, and keeping them in sync.
  - Solution:
    - Having a master loop as a dominant timer. Each time it restarts, the chosen sounds can join.
    - When choosing a track, it must be in queue until a loop restarts.

The loops will be 4 to 8 bars, with tempo of 115. I thought that's pretty good way to go. Key has not yet be determined.

Possible updates:

As the grid is 5x5, there must be a theme in the music. So perhaps additional "scenes" to play with in the future. 




