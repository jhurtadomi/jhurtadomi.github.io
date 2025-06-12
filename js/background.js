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

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  nodes = createNodes(getAdaptiveNodeCount());
});

// === Obstáculos ===
function getObstacleRects() {
  return OBSTACLE_SELECTORS.flatMap(selector => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    });
  });
}

function isInsideAnyObstacle(node, obstacles) {
  return obstacles.some(rect =>
    node.x >= rect.x &&
    node.x <= rect.x + rect.width &&
    node.y >= rect.y &&
    node.y <= rect.y + rect.height
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

function drawConnections() {
  const obstacles = getObstacleRects();

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (isInsideAnyObstacle(nodes[i], obstacles) || isInsideAnyObstacle(nodes[j], obstacles)) continue;

      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 130) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 0, 0, ${1 - dist / 130})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    // Conexiones al mouse
    if (mouse.x !== null && mouse.y !== null) {
      if (isInsideAnyObstacle(nodes[i], obstacles)) continue;

      const dx = mouse.x - nodes[i].x;
      const dy = mouse.y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        ctx.beginPath();
        const opacity = Math.pow(1 - dist / mouse.radius, 1.5);
        ctx.strokeStyle = `rgba(160, 160, 160, ${opacity})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "rgba(160, 160, 160, 0.3)";
        ctx.shadowBlur = 6;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }
}

function drawNodes() {
  const obstacles = getObstacleRects();
  const maxSpeed = 2;

  nodes.forEach(n => {
    n.vx += (Math.random() - 0.5) * 0.04;
    n.vy += (Math.random() - 0.5) * 0.04;
    n.vx = Math.max(-maxSpeed, Math.min(maxSpeed, n.vx));
    n.vy = Math.max(-maxSpeed, Math.min(maxSpeed, n.vy));

    n.x += n.vx;
    n.y += n.vy;

    // Rebote en bordes
    if (n.x < 0) {
      n.x = 0;
      n.vx *= -1;
    } else if (n.x > width) {
      n.x = width;
      n.vx *= -1;
    }

    if (n.y < 0) {
      n.y = 0;
      n.vy *= -1;
    } else if (n.y > height) {
      n.y = height;
      n.vy *= -1;
    }

    // Rebote en obstáculos DOM
    obstacles.forEach(rect => {
      if (
        n.x >= rect.x &&
        n.x <= rect.x + rect.width &&
        n.y >= rect.y &&
        n.y <= rect.y + rect.height
      ) {
        if (n.x < rect.x + rect.width / 2) {
          n.x = rect.x - 1;
        } else {
          n.x = rect.x + rect.width + 1;
        }
        n.vx *= -1;

        if (n.y < rect.y + rect.height / 2) {
          n.y = rect.y - 1;
        } else {
          n.y = rect.y + rect.height + 1;
        }
        n.vy *= -1;
      }
    });

    // No dibujar si está dentro de un obstáculo
    if (isInsideAnyObstacle(n, obstacles)) return;

    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fill();
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

function animate() {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    mouse.x || width / 2,
    mouse.y || height / 2,
    0,
    mouse.x || width / 2,
    mouse.y || height / 2,
    mouse.radius
  );
  gradient.addColorStop(0, "rgba(52,152,219,0.02)");
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawConnections();
  // drawMouseEffect(); // Activa si deseas el efecto visual del mouse
  drawNodes();

  requestAnimationFrame(animate);
}

animate();
