# Fuzzy Logic Smart Fan Controller

This project implements a fuzzy logic based smart fan controller.
It is specifically based on the **Mamdani Fuzzy Inference System (Mamdani FIS)**.

## Project Idea

The system decides fan speed based on two inputs:

- **Temperature** in degree Celsius
- **Humidity** in percentage

Instead of using rigid conditions, it uses fuzzy logic with linguistic values:

- Temperature: `Cold`, `Pleasant`, `Hot`
- Humidity: `Dry`, `Normal`, `Humid`
- Output fan speed: `Low`, `Medium`, `High`

## Fuzzy Model Used

This project uses the **Mamdani fuzzy logic model**.

In this model:

- Inputs are converted into fuzzy membership values
- Rules are written in IF-THEN form using linguistic terms
- Rule evaluation uses **MIN** for `AND`
- Output fuzzy sets are combined using **MAX**
- Final crisp output is obtained using **centroid defuzzification**

## Interface Highlights

The interface includes:

- A top-left **Inputs** panel for temperature and humidity sliders
- A top-right **Current Decision** panel that shows:
  - animated fan visualization
  - airflow effect
  - speed percentage ring
  - output label like `Low`, `Medium`, or `High`
  - RPM display
  - power bars below the fan
- Membership charts for temperature, humidity, and output fan speed
- A fuzzy rule base section
- A short explanation section of the fuzzy system workflow

## Concepts Used

- Fuzzification
- Mamdani fuzzy inference
- Min-Max composition
- Centroid defuzzification

## Rule Examples

1. IF temperature is `Cold` AND humidity is `Dry` THEN fan speed is `Low`
2. IF temperature is `Pleasant` AND humidity is `Normal` THEN fan speed is `Medium`
3. IF temperature is `Hot` AND humidity is `Humid` THEN fan speed is `High`

## Files

- `index.html` - main project interface
- `style.css` - page design, responsive layout, and fan animation styling
- `script.js` - fuzzy logic calculations, rule evaluation, charts, and live output updates
- `README.md` - project explanation and usage guide

## How to Run

1. Open the `fuzzy-smart-fan` folder.
2. Double-click `index.html`.
3. Move the sliders in the top-left input panel.
4. Watch the animated fan and decision output update in real time.

## Working Principle

The project works in the following order:

1. Crisp temperature and humidity values are taken as inputs.
2. The inputs are converted into fuzzy membership values.
3. Mamdani IF-THEN rules are evaluated using `MIN` for `AND`.
4. The output fuzzy sets are aggregated using `MAX`.
5. A final crisp fan speed is generated using centroid defuzzification.
6. The interface updates the animated fan, RPM, power bars, and output label in real time.

## Example Input

- Temperature: `34 deg C`
- Humidity: `78%`

Expected result:

- Strong membership in `Hot`
- Strong membership in `Humid`
- Final fan speed close to `High`
- Fan animation becomes faster and the power bars become stronger

## Project Summary

- Easy to understand
- Interactive and visual
- Shows the full fuzzy system workflow
- Demonstrates both fuzzy logic theory and a live output visualization
