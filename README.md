# Quiz Application

This repository contains my completed solution to the [Quiz App](https://roadmap.sh/projects/quiz-app) challenge on roadmap.sh.

## Project Details
The objective of this project is to build a functional, responsive quiz application that tests users on technical assessment items. The application handles dynamic state management through a complete multi-phase assessment workflow (Start ➔ Quiz ➔ Results) while enforcing structural constraint rules like strict question timers and score penalty logic.

## Requirements Met

- **Multi-Phase Quiz Lifecycle Pipeline:** Fully orchestrates transitions across three explicit views using state tracking:
  - `START`: Initialization screen showcasing quiz rules, quantities, and operational mechanics.
  - `QUIZ`: Active examination environment rendering real-time metrics and selection arrays.
  - `RESULTS`: Detailed metric evaluation card highlighting performance ratios and answer logs.
- **Constraint-Driven Timer Engine:** Implements a reactive 60-second limit hook per question item. Upon depletion, the engine automatically records a timeout, applies a `-1` point penalty deduction, and instantly auto-advances the question flow.
- **Instant Skip Mechanics:** Offers a manual "Skip" control element during active questions. Bypassing an item registers a penalty deduction of `-1` to the running score without exposing correct keys mid-quiz.
- **Interactive Feedback Mode:** Selecting any option immediately disengages inputs, freezes the timer context, and highlights structural validation states: matching correct choices with semantic emerald themes and incorrect user selections with rose indicators.
- **Itemized Performance Review:** The final dashboard calculates a precise net score alongside a scrollable history log tracking user selections vs. correct answers for robust post-exam auditing.
- **Monochrome Styling Architecture (Tailwind v4):** Features a sleek, distraction-free monochrome system implementing custom palettes directly via native CSS theme tokens (`@theme`) supporting independent dark mode and light mode view variations.

## File Structure

```text
quiz-app-rm/
├── src/
│   ├── data/
│   │   └── questions.json     # Question bank array structure
│   ├── App.jsx                # Core quiz engine lifecycle & interface logic
│   ├── index.css              # Tailwind v4 directives & monochrome configuration
│   └── main.jsx               # React hydration entry point
├── postcss.config.js          # PostCSS build compilation configurations
├── package.json               # Dependencies and execution script mappings
└── README.md                  # Project documentation
```

## File Structure
To pull down the project and run the assessment platform locally:
- Clone the repository and enter the workspace root:
```bash
cd quiz-app-rm
```
- Install the required runtime package dependencies:
```bash
npm install
```
- Boot up the Vite build development server pipeline:
```bash
npm run dev
```
- Launch the platform in your browser window:
Navigate to http://localhost:5173/ to interact with the quiz app interface.
