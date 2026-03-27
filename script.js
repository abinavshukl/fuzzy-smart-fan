const temperatureRange = document.getElementById("temperatureRange");
const humidityRange = document.getElementById("humidityRange");
const temperatureText = document.getElementById("temperatureText");
const humidityText = document.getElementById("humidityText");
const speedValue = document.getElementById("speedValue");
const speedLabel = document.getElementById("speedLabel");
const dominantTemperature = document.getElementById("dominantTemperature");
const dominantHumidity = document.getElementById("dominantHumidity");
const fanDecision = document.getElementById("fanDecision");
const temperatureMemberships = document.getElementById("temperatureMemberships");
const humidityMemberships = document.getElementById("humidityMemberships");
const speedMemberships = document.getElementById("speedMemberships");
const rulesList = document.getElementById("rulesList");
const exampleButton = document.getElementById("exampleButton");
const resetButton = document.getElementById("resetButton");
const fanVisual = document.getElementById("fanVisual");
const fanBlades = document.getElementById("fanBlades");
const fanMotionDisc = document.getElementById("fanMotionDisc");
const fanRpm = document.getElementById("fanRpm");
const powerBars = Array.from(document.querySelectorAll(".power-bar"));

const temperatureCanvas = document.getElementById("temperatureCanvas");
const humidityCanvas = document.getElementById("humidityCanvas");
const speedCanvas = document.getElementById("speedCanvas");

const colors = {
  low: "#2b6f77",
  medium: "#de9e36",
  high: "#c95c2b"
};

const labels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  cold: "Cold",
  pleasant: "Pleasant",
  hot: "Hot",
  dry: "Dry",
  normal: "Normal",
  humid: "Humid"
};

const powerColors = ["#2b6f77", "#5b9585", "#de9e36", "#db7f33", "#c95c2b"];

const rules = [
  { id: 1, temperature: "cold", humidity: "dry", output: "low" },
  { id: 2, temperature: "cold", humidity: "normal", output: "low" },
  { id: 3, temperature: "cold", humidity: "humid", output: "medium" },
  { id: 4, temperature: "pleasant", humidity: "dry", output: "low" },
  { id: 5, temperature: "pleasant", humidity: "normal", output: "medium" },
  { id: 6, temperature: "pleasant", humidity: "humid", output: "high" },
  { id: 7, temperature: "hot", humidity: "dry", output: "medium" },
  { id: 8, temperature: "hot", humidity: "normal", output: "high" },
  { id: 9, temperature: "hot", humidity: "humid", output: "high" }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function triangle(x, a, b, c) {
  if (x <= a || x >= c) {
    return 0;
  }

  if (x === b) {
    return 1;
  }

  if (x < b) {
    return Number(((x - a) / (b - a)).toFixed(3));
  }

  return Number(((c - x) / (c - b)).toFixed(3));
}

function leftShoulder(x, a, b) {
  if (x <= a) {
    return 1;
  }

  if (x >= b) {
    return 0;
  }

  return Number(((b - x) / (b - a)).toFixed(3));
}

function rightShoulder(x, a, b) {
  if (x <= a) {
    return 0;
  }

  if (x >= b) {
    return 1;
  }

  return Number(((x - a) / (b - a)).toFixed(3));
}

function fuzzifyTemperature(value) {
  return {
    cold: leftShoulder(value, 12, 22),
    pleasant: triangle(value, 18, 25, 32),
    hot: rightShoulder(value, 28, 38)
  };
}

function fuzzifyHumidity(value) {
  return {
    dry: leftShoulder(value, 30, 50),
    normal: triangle(value, 40, 55, 70),
    humid: rightShoulder(value, 60, 80)
  };
}

function outputMemberships(x) {
  return {
    low: leftShoulder(x, 25, 45),
    medium: triangle(x, 35, 55, 75),
    high: rightShoulder(x, 65, 85)
  };
}

function aggregateOutput(ruleActivations) {
  const aggregated = [];
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x <= 100; x += 1) {
    let y = 0;
    const memberships = outputMemberships(x);

    ruleActivations.forEach((rule) => {
      const clipped = Math.min(rule.strength, memberships[rule.output]);
      y = Math.max(y, clipped);
    });

    aggregated.push({ x, y });
    numerator += x * y;
    denominator += y;
  }

  const crispValue = denominator === 0 ? 0 : numerator / denominator;

  return {
    aggregated,
    crispValue: Number(crispValue.toFixed(2))
  };
}

function getDominantLabel(map) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])[0][0];
}

function outputLabel(value) {
  if (value < 40) {
    return "Low";
  }

  if (value < 68) {
    return "Medium";
  }

  return "High";
}

function updateFanMotion(outputValue) {
  const normalized = clamp(outputValue, 0, 100);
  const level = outputLabel(normalized).toLowerCase();
  const duration = clamp(Number((1.95 - normalized * 0.015).toFixed(2)), 0.42, 1.95);
  const blurOpacity = clamp(Number((0.1 + normalized * 0.0085).toFixed(2)), 0.1, 0.95);
  const bladeOpacity = clamp(Number((1 - normalized * 0.0075).toFixed(2)), 0.18, 1);
  const bladeBlur = clamp(Number((normalized * 0.045).toFixed(2)), 0, 4.5);
  const airOpacity = clamp(Number((0.16 + normalized * 0.008).toFixed(2)), 0.16, 0.96);
  const airDistance = clamp(Number((4 + normalized * 0.18).toFixed(1)), 4, 22);
  const airDuration = clamp(Number((1.45 - normalized * 0.009).toFixed(2)), 0.48, 1.45);
  const haloOpacity = clamp(Number((0.16 + normalized * 0.006).toFixed(2)), 0.16, 0.76);
  const rpm = Math.round(120 + normalized * 14);
  const runningState = normalized < 2 ? "paused" : "running";

  fanVisual.dataset.speed = level;
  fanVisual.style.setProperty("--fan-duration", `${duration}s`);
  fanVisual.style.setProperty("--fan-blur-opacity", blurOpacity);
  fanVisual.style.setProperty("--fan-blade-opacity", bladeOpacity);
  fanVisual.style.setProperty("--fan-blade-blur", `${bladeBlur}px`);
  fanVisual.style.setProperty("--fan-air-opacity", airOpacity);
  fanVisual.style.setProperty("--fan-air-distance", `${airDistance}px`);
  fanVisual.style.setProperty("--fan-air-duration", `${airDuration}s`);
  fanVisual.style.setProperty("--fan-halo-opacity", haloOpacity);

  fanBlades.style.animationPlayState = runningState;
  fanMotionDisc.style.animationPlayState = runningState;
  fanRpm.textContent = `${rpm} RPM`;
  fanRpm.style.color = colors[level];

  powerBars.forEach((bar, index) => {
    const progress = clamp(normalized / 20 - index, 0, 1);
    const scale = 0.72 + progress * 0.4;
    bar.style.transform = `scaleY(${scale})`;
    bar.style.opacity = `${0.58 + progress * 0.4}`;
    bar.style.background = progress > 0.08 ? `linear-gradient(180deg, ${powerColors[index]}, ${powerColors[index]}cc)` : "linear-gradient(180deg, rgba(170, 151, 130, 0.78), rgba(109, 88, 66, 0.7))";
    bar.style.boxShadow = progress > 0.08 ? `inset 0 1px 0 rgba(255,255,255,0.24), 0 0 14px ${powerColors[index]}33` : "inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 6px 12px rgba(87, 53, 20, 0.08)";
  });
}

function formatMemberships(container, data, colorMap) {
  container.innerHTML = "";

  Object.entries(data).forEach(([key, value]) => {
    const item = document.createElement("div");
    item.className = "membership-item";
    item.innerHTML = `
      <span>${labels[key]}</span>
      <strong style="color: ${colorMap[key]};">${value.toFixed(2)}</strong>
    `;
    container.appendChild(item);
  });
}

function renderRules(ruleActivations) {
  rulesList.innerHTML = "";

  ruleActivations.forEach((rule) => {
    const card = document.createElement("article");
    card.className = `rule-card${rule.strength > 0 ? " active" : ""}`;
    card.innerHTML = `
      <h3>Rule ${rule.id}</h3>
      <p>IF temperature is <strong>${labels[rule.temperature]}</strong> AND humidity is <strong>${labels[rule.humidity]}</strong> THEN fan speed is <strong>${labels[rule.output]}</strong></p>
      <span class="rule-strength">Strength: ${rule.strength.toFixed(2)}</span>
    `;
    rulesList.appendChild(card);
  });
}

function drawAxes(ctx, width, height, maxX, maxY) {
  const axisTop = 16;
  const axisLeft = 44;
  const axisBottom = height - 28;
  const axisRight = width - 20;

  ctx.strokeStyle = "rgba(34, 32, 28, 0.28)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(axisLeft, axisTop);
  ctx.lineTo(axisLeft, axisBottom);
  ctx.lineTo(axisRight, axisBottom);
  ctx.stroke();

  ctx.fillStyle = "rgba(34, 32, 28, 0.72)";
  ctx.font = '12px "Trebuchet MS"';

  ctx.save();
  ctx.translate(16, (axisTop + axisBottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Membership", 0, 0);
  ctx.restore();

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("0", 34, height - 10);
  ctx.fillText(String(maxX), width - 38, height - 10);
  ctx.fillText(String(maxY), 20, 30);
}

function mapPoint(x, y, maxX, maxY, width, height) {
  const drawableWidth = width - 64;
  const drawableHeight = height - 44;

  return {
    px: 44 + (x / maxX) * drawableWidth,
    py: height - 28 - (y / maxY) * drawableHeight
  };
}

function drawSetLine(ctx, points, color, maxX, width, height) {
  ctx.beginPath();
  points.forEach((point, index) => {
    const mapped = mapPoint(point[0], point[1], maxX, 1, width, height);
    if (index === 0) {
      ctx.moveTo(mapped.px, mapped.py);
    } else {
      ctx.lineTo(mapped.px, mapped.py);
    }
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawVerticalMarker(ctx, value, maxX, width, height) {
  const mapped = mapPoint(value, 0, maxX, 1, width, height);
  ctx.beginPath();
  ctx.moveTo(mapped.px, 16);
  ctx.lineTo(mapped.px, height - 28);
  ctx.strokeStyle = "rgba(34, 32, 28, 0.5)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTemperatureChart(value) {
  const ctx = temperatureCanvas.getContext("2d");
  const { width, height } = temperatureCanvas;
  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, width, height, 45, 1);
  drawSetLine(ctx, [[0, 1], [12, 1], [22, 0], [45, 0]], colors.low, 45, width, height);
  drawSetLine(ctx, [[0, 0], [18, 0], [25, 1], [32, 0], [45, 0]], colors.medium, 45, width, height);
  drawSetLine(ctx, [[0, 0], [28, 0], [38, 1], [45, 1]], colors.high, 45, width, height);
  drawVerticalMarker(ctx, value, 45, width, height);
}

function drawHumidityChart(value) {
  const ctx = humidityCanvas.getContext("2d");
  const { width, height } = humidityCanvas;
  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, width, height, 100, 1);
  drawSetLine(ctx, [[0, 1], [30, 1], [50, 0], [100, 0]], colors.low, 100, width, height);
  drawSetLine(ctx, [[0, 0], [40, 0], [55, 1], [70, 0], [100, 0]], colors.medium, 100, width, height);
  drawSetLine(ctx, [[0, 0], [60, 0], [80, 1], [100, 1]], colors.high, 100, width, height);
  drawVerticalMarker(ctx, value, 100, width, height);
}

function drawOutputChart(aggregated, crispValue) {
  const ctx = speedCanvas.getContext("2d");
  const { width, height } = speedCanvas;
  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, width, height, 100, 1);
  drawSetLine(ctx, [[0, 1], [25, 1], [45, 0], [100, 0]], colors.low, 100, width, height);
  drawSetLine(ctx, [[0, 0], [35, 0], [55, 1], [75, 0], [100, 0]], colors.medium, 100, width, height);
  drawSetLine(ctx, [[0, 0], [65, 0], [85, 1], [100, 1]], colors.high, 100, width, height);

  ctx.beginPath();
  aggregated.forEach((point, index) => {
    const mapped = mapPoint(point.x, point.y, 100, 1, width, height);
    if (index === 0) {
      ctx.moveTo(mapped.px, mapped.py);
    } else {
      ctx.lineTo(mapped.px, mapped.py);
    }
  });
  ctx.lineTo(mapPoint(100, 0, 100, 1, width, height).px, mapPoint(100, 0, 100, 1, width, height).py);
  ctx.lineTo(mapPoint(0, 0, 100, 1, width, height).px, mapPoint(0, 0, 100, 1, width, height).py);
  ctx.closePath();
  ctx.fillStyle = "rgba(201, 92, 43, 0.18)";
  ctx.fill();

  drawVerticalMarker(ctx, crispValue, 100, width, height);
}

function update() {
  const temperature = Number(temperatureRange.value);
  const humidity = Number(humidityRange.value);

  temperatureText.innerHTML = `${temperature}&deg;C`;
  humidityText.textContent = `${humidity}%`;

  const temperatureData = fuzzifyTemperature(temperature);
  const humidityData = fuzzifyHumidity(humidity);

  const ruleActivations = rules.map((rule) => ({
    ...rule,
    strength: Math.min(temperatureData[rule.temperature], humidityData[rule.humidity])
  }));

  const output = aggregateOutput(ruleActivations);
  const speedStates = outputMemberships(output.crispValue);
  const label = outputLabel(output.crispValue);
  const level = label.toLowerCase();

  speedValue.textContent = `${output.crispValue.toFixed(1)}%`;
  speedLabel.textContent = label;
  speedLabel.style.color = colors[level];
  dominantTemperature.textContent = labels[getDominantLabel(temperatureData)];
  dominantHumidity.textContent = labels[getDominantLabel(humidityData)];
  fanDecision.textContent = label;
  fanDecision.style.color = colors[level];

  updateFanMotion(output.crispValue);

  formatMemberships(temperatureMemberships, temperatureData, {
    cold: colors.low,
    pleasant: colors.medium,
    hot: colors.high
  });

  formatMemberships(humidityMemberships, humidityData, {
    dry: colors.low,
    normal: colors.medium,
    humid: colors.high
  });

  formatMemberships(speedMemberships, speedStates, {
    low: colors.low,
    medium: colors.medium,
    high: colors.high
  });

  renderRules(ruleActivations);
  drawTemperatureChart(temperature);
  drawHumidityChart(humidity);
  drawOutputChart(output.aggregated, output.crispValue);
}

temperatureRange.addEventListener("input", update);
humidityRange.addEventListener("input", update);

exampleButton.addEventListener("click", () => {
  temperatureRange.value = 34;
  humidityRange.value = 78;
  update();
});

resetButton.addEventListener("click", () => {
  temperatureRange.value = 28;
  humidityRange.value = 55;
  update();
});

update();

