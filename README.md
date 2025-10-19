# Ties

**Ties** is a physics-based arena (puzzle?) game built using **HTML, CSS, and JavaScript**.  

Two balls, one controlled by you, and one by an AI, bounce around inside a circular arena.  

Each time a ball hits the arena’s boundary, it creates a glowing **“tie”**, a line tethered between the point of impact and the ball.

I also used the web audio API to create a unique sound upon each bounce! And also used the API to create a sound for the tie cut!

Your goal?  
**Cut all of your opponent’s ties before they cut yours.**

**Play at:** https://irtaza.xyz/Ties

## Gameplay

![Demo](https://hc-cdn.hel1.your-objectstorage.com/s/v3/0239fdf3c196b3fb97adf57f837cae44cc5b8fdc_ties.gif)

- The arena is a perfect circle.
- There are **two balls**:
  - 🟢 **Player Ball**: controlled by you.
  - 🔴 **Enemy Ball**: moves randomly.
- When a ball **bounces off the arena’s edge**, it forms a **tie**.
- You can **cut enemy ties** by colliding with them.
- If all your ties are cut, **you lose**.
- If the enemy’s ties are cut first, **you win!**

---

## Controls

### Mobile phone
If playing on a **mobile phone**, **swipe in the direction you want to move**, when the ball glows!

### Keyboard

| Action              | Keys                                                   |
| ------------------- | ------------------------------------------------------ |
| Change Direction    | ⬆️ ⬇️ ⬅️ ➡️ (Arrow Keys)                               |
| Diagonal Directions | Press two arrow keys together (e.g. ⬆️ + ➡️ for northeast) |

Every **5 seconds**, your ball briefly glows, and that’s when you can change direction.  
Between direction windows, your ball continues moving in its last chosen direction.

---

## Strategy

- Time your direction changes carefully — you can’t turn anytime!
- Use the arena’s bounce to your advantage.
- Aim to slice through the AI’s ties while keeping yours safe.

---
