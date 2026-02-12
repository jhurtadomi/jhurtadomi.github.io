const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const mouse = {
  x: null,
  y: null,
  radius: 280
};

const OBSTACLE_SELECTORS = ['.card', '.panel', '.profile-box'];
let cachedObstacles = [];
let obstacleUpdateTimer = null;

// === Event Listeners ===
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  nodes = createNodes(getAdaptiveNodeCount());
  updateObstacleCache();
});

// === Gestión de Obstáculos (con caché) ===
function updateObstacleCache() {
  cachedObstacles = OBSTACLE_SELECTORS.flatMap(selector => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height
      };
    });
  });
}

// Actualizar obstáculos cada 500ms en lugar de cada frame
function scheduleObstacleUpdate() {
  if (obstacleUpdateTimer) clearTimeout(obstacleUpdateTimer);
  obstacleUpdateTimer = setTimeout(updateObstacleCache, 500);
}

function isInsideAnyObstacle(node) {
  return cachedObstacles.some(rect =>
    node.x >= rect.x &&
    node.x <= rect.right &&
    node.y >= rect.y &&
    node.y <= rect.bottom
  );
}

function getAdaptiveNodeCount() {
  return Math.floor((width * height) / 8000);
}

function createNodes(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: 2.5 + Math.random() * 1.5
  }));
}

let nodes = createNodes(getAdaptiveNodeCount());
updateObstacleCache();

// === Spatial Partitioning (Grid) para optimizar conexiones ===
const CELL_SIZE = 130; // Mismo que la distancia máxima de conexión
function getGridCell(x, y) {
  return `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`;
}

function buildSpatialGrid() {
  const grid = new Map();
  nodes.forEach((node, index) => {
    const cell = getGridCell(node.x, node.y);
    if (!grid.has(cell)) grid.set(cell, []);
    grid.get(cell).push({ node, index });
  });
  return grid;
}

function getNearbyCells(x, y) {
  const cells = [];
  const cellX = Math.floor(x / CELL_SIZE);
  const cellY = Math.floor(y / CELL_SIZE);
  
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      cells.push(`${cellX + dx},${cellY + dy}`);
    }
  }
  return cells;
}

function drawConnections() {
  const grid = buildSpatialGrid();
  const processed = new Set();

  nodes.forEach((node, i) => {
    if (isInsideAnyObstacle(node)) return;

    const nearbyCells = getNearbyCells(node.x, node.y);
    
    nearbyCells.forEach(cellKey => {
      const cellNodes = grid.get(cellKey);
      if (!cellNodes) return;

      cellNodes.forEach(({ node: otherNode, index: j }) => {
        if (i >= j) return; // Evitar duplicados
        const pairKey = `${i}-${j}`;
        if (processed.has(pairKey)) return;
        processed.add(pairKey);

        if (isInsideAnyObstacle(otherNode)) return;

        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 0, 0, ${1 - dist / 130})`;
          ctx.lineWidth = 1.5;
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(otherNode.x, otherNode.y);
          ctx.stroke();
        }
      });
    });

    // Conexiones al mouse
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < mouse.radius) {
        ctx.beginPath();
        const opacity = Math.pow(1 - dist / mouse.radius, 1.5);
        ctx.strokeStyle = `rgba(160, 160, 160, ${opacity})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "rgba(160, 160, 160, 0.3)";
        ctx.shadowBlur = 6;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  });
}

function handleObstacleCollision(node, rect) {
  const margin = 2;
  
  // Calcular penetración en cada lado
  const penetrationLeft = (rect.x + rect.width) - node.x;
  const penetrationRight = node.x - rect.x;
  const penetrationTop = (rect.y + rect.height) - node.y;
  const penetrationBottom = node.y - rect.y;
  
  // Encontrar el lado con menor penetración
  const minPenetration = Math.min(
    penetrationLeft,
    penetrationRight,
    penetrationTop,
    penetrationBottom
  );
  
  // Empujar el nodo hacia afuera por el lado más cercano
  if (minPenetration === penetrationLeft) {
    node.x = rect.x - margin;
    node.vx = -Math.abs(node.vx) * 0.8;
  } else if (minPenetration === penetrationRight) {
    node.x = rect.right + margin;
    node.vx = Math.abs(node.vx) * 0.8;
  } else if (minPenetration === penetrationTop) {
    node.y = rect.y - margin;
    node.vy = -Math.abs(node.vy) * 0.8;
  } else {
    node.y = rect.bottom + margin;
    node.vy = Math.abs(node.vy) * 0.8;
  }
}

function drawNodes() {
  const maxSpeed = 2;

  nodes.forEach(n => {
    // Movimiento browniano
    n.vx += (Math.random() - 0.5) * 0.04;
    n.vy += (Math.random() - 0.5) * 0.04;
    n.vx = Math.max(-maxSpeed, Math.min(maxSpeed, n.vx));
    n.vy = Math.max(-maxSpeed, Math.min(maxSpeed, n.vy));

    n.x += n.vx;
    n.y += n.vy;

    // Rebote en bordes con amortiguación
    if (n.x < 0 || n.x > width) {
      n.x = Math.max(0, Math.min(width, n.x));
      n.vx *= -0.8;
    }
    if (n.y < 0 || n.y > height) {
      n.y = Math.max(0, Math.min(height, n.y));
      n.vy *= -0.8;
    }

    // Colisión mejorada con obstáculos
    cachedObstacles.forEach(rect => {
      if (
        n.x >= rect.x &&
        n.x <= rect.right &&
        n.y >= rect.y &&
        n.y <= rect.bottom
      ) {
        handleObstacleCollision(n, rect);
      }
    });

    // Dibujar solo si no está dentro de un obstáculo
    if (!isInsideAnyObstacle(n)) {
      ctx.beginPath();
      ctx.fillStyle = "#000";
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawMouseEffect() {
  if (mouse.x === null || mouse.y === null) return;

  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = Date.now() * 0.03;
  ctx.strokeStyle = "rgba(231,76,60,0.6)";
  ctx.lineWidth = 2;
  ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(231,76,60,0.9)";
  ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(231,76,60,0.8)";
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

let lastGradientUpdate = 0;
let cachedGradient = null;

function animate(timestamp) {
  ctx.clearRect(0, 0, width, height);

  // Actualizar gradiente solo cada 100ms
  if (!lastGradientUpdate || timestamp - lastGradientUpdate > 100) {
    cachedGradient = ctx.createRadialGradient(
      mouse.x || width / 2,
      mouse.y || height / 2,
      0,
      mouse.x || width / 2,
      mouse.y || height / 2,
      mouse.radius
    );
    cachedGradient.addColorStop(0, "rgba(52,152,219,0.02)");
    cachedGradient.addColorStop(1, "transparent");
    lastGradientUpdate = timestamp;
  }
  
  ctx.fillStyle = cachedGradient;
  ctx.fillRect(0, 0, width, height);

  drawConnections();
  // drawMouseEffect(); // Activa si deseas el efecto visual del mouse
  drawNodes();

  requestAnimationFrame(animate);
}

animate();