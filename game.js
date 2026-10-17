// ==================================================
// ONE PIECE: NEW WORLD - GAME.JS
// Bản game 2D chạy trên trình duyệt
// ==================================================

"use strict";

// ---------- CẤU HÌNH ----------
const SAVE_KEY = "one_piece_new_world_save_v1";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas?.getContext("2d");

if (!canvas || !ctx) {
  console.error("Không tìm thấy gameCanvas trong index.html!");
}

// ---------- DỮ LIỆU ĐẢO ----------
const islands = [
  {
    name: "Đảo Khởi Đầu",
    description: "Nơi hành trình hải tặc bắt đầu.",
    minLevel: 1,
    price: 0,
    enemy: "Kẻ tập sự",
    enemyHp: 35,
    reward: 20,
    quest: "Đánh bại 3 kẻ tập sự",
    target: 3
  },
  {
    name: "Tàu Alvida",
    description: "Con tàu của nữ hải tặc Alvida.",
    minLevel: 2,
    price: 100,
    enemy: "Hải tặc Alvida",
    enemyHp: 60,
    reward: 35,
    quest: "Đánh bại 4 hải tặc",
    target: 4
  },
  {
    name: "Đảo Hải Quân",
    description: "Căn cứ của lực lượng Hải Quân.",
    minLevel: 4,
    price: 250,
    enemy: "Lính Hải Quân",
    enemyHp: 90,
    reward: 55,
    quest: "Đánh bại 5 lính Hải Quân",
    target: 5
  },
  {
    name: "Đảo Chú Hề",
    description: "Hòn đảo do băng hải tặc Buggy chiếm giữ.",
    minLevel: 6,
    price: 500,
    enemy: "Hải tặc Buggy",
    enemyHp: 125,
    reward: 80,
    quest: "Đánh bại 5 hải tặc Buggy",
    target: 5
  },
  {
    name: "Đảo Usopp",
    description: "Một hòn đảo yên bình với nhiều bí mật.",
    minLevel: 8,
    price: 850,
    enemy: "Chiến binh đảo",
    enemyHp: 165,
    reward: 110,
    quest: "Đánh bại 6 chiến binh",
    target: 6
  },
  {
    name: "Tàu Baratie",
    description: "Nhà hàng nổi giữa biển.",
    minLevel: 11,
    price: 1300,
    enemy: "Đầu bếp chiến đấu",
    enemyHp: 210,
    reward: 145,
    quest: "Đánh bại 6 đối thủ",
    target: 6
  },
  {
    name: "Đảo Người Cá",
    description: "Vùng đất dưới đại dương.",
    minLevel: 15,
    price: 2200,
    enemy: "Chiến binh Người Cá",
    enemyHp: 280,
    reward: 200,
    quest: "Đánh bại 7 chiến binh",
    target: 7
  }
];

// ---------- DỮ LIỆU TRÁI ÁC QUỶ ----------
const fruits = {
  none: {
    name: "Chưa có trái",
    icon: "⚔️",
    description: "Chiến đấu bằng đòn đánh thường.",
    color: "#eeeeee",
    skills: [
      { name: "Chém mạnh", damage: 25, cooldown: 2 },
      { name: "Đòn liên hoàn", damage: 40, cooldown: 5 },
      { name: "Tuyệt kỹ kiếm", damage: 65, cooldown: 9 }
    ]
  },

  gomu: {
    name: "Gomu Gomu no Mi",
    icon: "🍈",
    description: "Trái cao su với các đòn đánh tầm xa.",
    color: "#ffcc55",
    skills: [
      { name: "Gomu Pistol", damage: 35, cooldown: 2 },
      { name: "Gomu Gatling", damage: 65, cooldown: 5 },
      { name: "Gomu Bazooka", damage: 100, cooldown: 9 }
    ]
  },

  mera: {
    name: "Mera Mera no Mi",
    icon: "🔥",
    description: "Điều khiển lửa để gây sát thương.",
    color: "#ff7139",
    skills: [
      { name: "Hỏa quyền", damage: 40, cooldown: 2 },
      { name: "Hỏa cầu", damage: 75, cooldown: 5 },
      { name: "Bão lửa", damage: 120, cooldown: 9 }
    ]
  },

  magu: {
    name: "Magu Magu no Mi",
    icon: "🌋",
    description: "Sử dụng sức mạnh dung nham.",
    color: "#ff4939",
    skills: [
      { name: "Dung nham quyền", damage: 50, cooldown: 3 },
      { name: "Mưa dung nham", damage: 90, cooldown: 6 },
      { name: "Núi lửa bùng nổ", damage: 145, cooldown: 10 }
    ]
  }
};

// ---------- TRẠNG THÁI GAME ----------
const state = {
  level: 1,
  exp: 0,
  maxHp: 100,
  hp: 100,
  beli: 100,
  meat: 3,

  islandIndex: 0,
  unlockedIslands: 1,

  fruit: "none",
  hasSword: true,

  questProgress: 0,
  questCompleted: false,

  player: {
    x: 0,
    y: 0,
    size: 24,
    speed: 3,
    direction: "down",
    attacking: false,
    attackTimer: 0
  },

  enemies: [],
  effects: [],

  keys: {},
  move: {
    up: false,
    down: false,
    left: false,
    right: false
  },

  skillCooldowns: [0, 0, 0],
  attackCooldown: 0,

  running: true,
  lastTime: 0
};

// ---------- TIỆN ÍCH ----------
function getElement(id) {
  return document.getElementById(id);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function currentIsland() {
  return islands[state.islandIndex];
}

function currentFruit() {
  return fruits[state.fruit] || fruits.none;
}

function logMessage(message) {
  const log = getElement("log");
  if (!log) return;

  const item = document.createElement("div");
  item.textContent = "• " + message;

  log.prepend(item);

  while (log.children.length > 6) {
    log.removeChild(log.lastChild);
  }
}

// ---------- KÍCH THƯỚC KHUNG GAME ----------
function resizeCanvas() {
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();

  canvas.width = Math.max(320, Math.floor(rect.width));
  canvas.height = Math.max(300, Math.floor(rect.height));

  state.player.x = clamp(
    state.player.x || canvas.width / 2,
    30,
    canvas.width - 30
  );

  state.player.y = clamp(
    state.player.y || canvas.height / 2,
    70,
    canvas.height - 30
  );
}

window.addEventListener("resize", resizeCanvas);

// ---------- KHỞI TẠO QUÁI ----------
function spawnEnemies() {
  state.enemies = [];

  const island = currentIsland();
  const enemyCount = 5 + Math.min(state.islandIndex, 3);

  for (let i = 0; i < enemyCount; i++) {
    const x = random(45, canvas.width - 45);
    const y = random(90, canvas.height - 45);

    state.enemies.push({
      x,
      y,
      size: 22,
      hp: island.enemyHp,
      maxHp: island.enemyHp,
      damage: 5 + state.islandIndex * 2,
      speed: 0.45 + state.islandIndex * 0.08,
      attackTimer: random(0, 1),
      alive: true,
      name: island.enemy
    });
  }
}

// ---------- VẼ NỀN ----------
function drawBackground() {
  const island = currentIsland();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mặt đất
  ctx.fillStyle = "#82c96f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Các mảng cỏ
  for (let i = 0; i < 45; i++) {
    const x = (i * 83 + state.islandIndex * 41) % canvas.width;
    const y = (i * 57 + 20) % canvas.height;

    ctx.fillStyle = i % 2 ? "#76bd63" : "#8bd277";
    ctx.fillRect(x, y, 18, 8);
  }

  // Đường đi
  ctx.fillStyle = "#d8c18c";
  ctx.fillRect(0, canvas.height * 0.56, canvas.width, 35);

  ctx.fillRect(
    canvas.width * 0.48,
    0,
    35,
    canvas.height
  );

  // Bờ biển
  ctx.fillStyle = "#54c7e8";
  ctx.fillRect(0, 0, canvas.width, 28);
  ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
  ctx.fillRect(0, 0, 18, canvas.height);
  ctx.fillRect(canvas.width - 18, 0, 18, canvas.height);

  // Tên đảo
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(25, 36, Math.min(220, canvas.width - 50), 32);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px Arial";
  ctx.fillText(island.name, 35, 57);

  // Nhà trên đảo
  drawHouse(
    canvas.width * 0.23,
    canvas.height * 0.27
  );

  drawHouse(
    canvas.width * 0.76,
    canvas.height * 0.72
  );

  // Cây
  drawTree(
    canvas.width * 0.78,
    canvas.height * 0.25
  );

  drawTree(
    canvas.width * 0.22,
    canvas.height * 0.75
  );
}

function drawHouse(x, y) {
  ctx.fillStyle = "#e8c28b";
  ctx.fillRect(x - 22, y, 44, 32);

  ctx.fillStyle = "#a64c32";
  ctx.beginPath();
  ctx.moveTo(x - 30, y);
  ctx.lineTo(x, y - 23);
  ctx.lineTo(x + 30, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#75452a";
  ctx.fillRect(x - 6, y + 14, 12, 18);
}

function drawTree(x, y) {
  ctx.fillStyle = "#80502d";
  ctx.fillRect(x - 5, y, 10, 27);

  ctx.fillStyle = "#277d42";
  ctx.beginPath();
  ctx.arc(x, y - 5, 19, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3b994e";
  ctx.beginPath();
  ctx.arc(x - 8, y - 11, 12, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- VẼ NHÂN VẬT ----------
function drawPlayer() {
  const p = state.player;

  // Bóng
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 13, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thân
  ctx.fillStyle = "#e74444";
  ctx.fillRect(p.x - 10, p.y - 2, 20, 20);

  // Đầu
  ctx.fillStyle = "#ffd2a6";
  ctx.beginPath();
  ctx.arc(p.x, p.y - 10, 10, 0, Math.PI * 2);
  ctx.fill();

  // Mũ
  ctx.fillStyle = "#f5d34d";
  ctx.fillRect(p.x - 13, p.y - 20, 26, 5);

  ctx.fillStyle = "#e6b83c";
  ctx.fillRect(p.x - 9, p.y - 25, 18, 7);

  // Mắt
  ctx.fillStyle = "#222222";
  ctx.fillRect(p.x - 4, p.y - 12, 2, 2);
  ctx.fillRect(p.x + 3, p.y - 12, 2, 2);

  // Vòng sáng khi đang tấn công
  if (p.attacking) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 28, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ---------- VẼ QUÁI ----------
function drawEnemies() {
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    // Bóng
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(
      enemy.x,
      enemy.y + 12,
      13,
      5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Thân
    ctx.fillStyle =
      state.islandIndex === 2 ? "#526bd5" :
      state.islandIndex === 3 ? "#d74747" :
      state.islandIndex === 6 ? "#4389a5" :
      "#7850a6";

    ctx.fillRect(
      enemy.x - 10,
      enemy.y - 1,
      20,
      20
    );

    // Đầu
    ctx.fillStyle = "#f2c59e";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - 9, 9, 0, Math.PI * 2);
    ctx.fill();

    // Thanh máu
    const barWidth = 32;
    const ratio = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = "#3a2020";
    ctx.fillRect(
      enemy.x - barWidth / 2,
      enemy.y - 28,
      barWidth,
      5
    );

    ctx.fillStyle = "#ff4242";
    ctx.fillRect(
      enemy.x - barWidth / 2,
      enemy.y - 28,
      barWidth * ratio,
      5
    );
  }
}

// ---------- HIỆU ỨNG ----------
function addEffect(x, y, text, color) {
  state.effects.push({
    x,
    y,
    text,
    color,
    life: 0.7,
    maxLife: 0.7
  });
}

function drawEffects(delta) {
  for (const effect of state.effects) {
    effect.life -= delta;
    effect.y -= 25 * delta;

    ctx.globalAlpha = Math.max(
      0,
      effect.life / effect.maxLife
    );

    ctx.fillStyle = effect.color;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(effect.text, effect.x, effect.y);
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  state.effects = state.effects.filter(
    effect => effect.life > 0
  );
}

// ---------- DI CHUYỂN ----------
function updateMovement(delta) {
  const p = state.player;

  let dx = 0;
  let dy = 0;

  if (state.move.left || state.keys["a"] || state.keys["arrowleft"]) {
    dx -= 1;
  }

  if (state.move.right || state.keys["d"] || state.keys["arrowright"]) {
    dx += 1;
  }

  if (state.move.up || state.keys["w"] || state.keys["arrowup"]) {
    dy -= 1;
  }

  if (state.move.down || state.keys["s"] || state.keys["arrowdown"]) {
    dy += 1;
  }

  // Giúp di chuyển chéo không nhanh hơn bình thường
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  p.x += dx * p.speed * 60 * delta;
  p.y += dy * p.speed * 60 * delta;

  if (dx < 0) p.direction = "left";
  if (dx > 0) p.direction = "right";
  if (dy < 0) p.direction = "up";
  if (dy > 0) p.direction = "down";

  p.x = clamp(p.x, 28, canvas.width - 28);
  p.y = clamp(p.y, 75, canvas.height - 28);
}

// ---------- QUÁI ĐUỔI THEO NGƯỜI CHƠI ----------
function updateEnemies(delta) {
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    const dist = distance(enemy, state.player);

    if (dist > 30 && dist < 230) {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const length = Math.hypot(dx, dy) || 1;

      enemy.x += (dx / length) * enemy.speed * 60 * delta;
      enemy.y += (dy / length) * enemy.speed * 60 * delta;
    }

    enemy.attackTimer -= delta;

    if (dist < 34 && enemy.attackTimer <= 0) {
      enemy.attackTimer = 1.1;

      damagePlayer(enemy.damage);

      addEffect(
        state.player.x,
        state.player.y - 25,
        "-" + enemy.damage,
        "#ff4040"
      );
    }
  }
}

// ---------- NGƯỜI CHƠI NHẬN SÁT THƯƠNG ----------
function damagePlayer(amount) {
  state.hp -= amount;

  if (state.hp <= 0) {
    state.hp = 0;
    updateUI();

    logMessage("Bạn đã bị đánh bại! Hãy hồi sinh.");

    showDialog(
      "Bạn đã bị đánh bại",
      "Bạn được đưa về điểm hồi sinh. Máu được hồi lại, nhưng hãy cẩn thận khi chiến đấu!"
    );

    state.hp = state.maxHp;
    state.player.x = canvas.width / 2;
    state.player.y = canvas.height / 2;

    state.enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.x = random(45, canvas.width - 45);
        enemy.y = random(90, canvas.height - 45);
      }
    });
  }

  updateUI();
}

// ---------- TẤN CÔNG THƯỜNG ----------
function normalAttack() {
  if (state.attackCooldown > 0) return;

  state.attackCooldown = 0.45;
  state.player.attacking = true;
  state.player.attackTimer = 0.18;

  const damage = 15 + state.level * 3;

  let hit = false;

  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    if (distance(enemy, state.player) < 62) {
      damageEnemy(enemy, damage);
      addEffect(enemy.x, enemy.y - 24, "-" + damage, "#ffffff");
      hit = true;
    }
  }

  if (!hit) {
    logMessage("Không có kẻ địch trong tầm đánh.");
  }
}

// ---------- SỬ DỤNG CHIÊU ----------
function useSkill(index) {
  const fruit = currentFruit();
  const skill = fruit.skills[index];

  if (state.skillCooldowns[index] > 0) {
    logMessage("Chiêu đang hồi! Hãy chờ một chút.");
    return;
  }

  const damage = skill.damage + state.level * 4;
  const range = index === 2 ? 180 : index === 1 ? 130 : 90;

  state.skillCooldowns[index] = skill.cooldown;

  let hitCount = 0;

  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;

    if (distance(enemy, state.player) <= range) {
      damageEnemy(enemy, damage);

      addEffect(
        enemy.x,
        enemy.y - 26,
        "-" + damage,
        fruit.color
      );

      hitCount++;
    }
  }

  // Hiệu ứng chiêu
  const effectColor = fruit.color;

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = effectColor;
  ctx.beginPath();
  ctx.arc(
    state.player.x,
    state.player.y,
    range,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  addEffect(
    state.player.x,
    state.player.y - 40,
    skill.name,
    effectColor
  );

  logMessage(
    skill.name + " gây " + damage + " sát thương mỗi mục tiêu!"
  );

  if (hitCount === 0) {
    logMessage("Chiêu đã sử dụng nhưng không trúng mục tiêu.");
  }

  updateUI();
}

// ---------- QUÁI NHẬN SÁT THƯƠNG ----------
function damageEnemy(enemy, damage) {
  if (!enemy.alive) return;

  enemy.hp -= damage;

  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;

    state.beli += currentIsland().reward;
    state.exp += 20 + state.islandIndex * 5;

    state.questProgress++;

    logMessage(
      "Đã đánh bại " +
      enemy.name +
      "! +" +
      currentIsland().reward +
      " Beli."
    );

    checkLevelUp();
    checkQuestComplete();
    updateUI();

    // Nếu không còn quái, tạo nhóm mới
    if (state.enemies.every(item => !item.alive)) {
      setTimeout(() => {
        if (state.running) {
          spawnEnemies();
        }
      }, 800);
    }
  }
}

// ---------- LÊN CẤP ----------
function checkLevelUp() {
  while (state.exp >= state.level * 100) {
    state.exp -= state.level * 100;
    state.level++;

    state.maxHp += 15;
    state.hp = state.maxHp;

    state.player.speed = Math.min(
      4.2,
      3 + state.level * 0.04
    );

    logMessage("LÊN CẤP! Bạn đã đạt cấp " + state.level + ".");

    showDialog(
      "🎉 Lên cấp!",
      "Chúc mừng! Bạn đã đạt cấp " +
      state.level +
      ". Máu tối đa và sức mạnh của bạn đã tăng."
    );
  }
}

// ---------- NHIỆM VỤ ----------
function checkQuestComplete() {
  const island = currentIsland();

  if (
    !state.questCompleted &&
    state.questProgress >= island.target
  ) {
    state.questCompleted = true;

    const reward = 100 + state.islandIndex * 50;

    state.beli += reward;
    state.exp += 50;

    checkLevelUp();

    logMessage(
      "Hoàn thành nhiệm vụ! Nhận " + reward + " Beli."
    );

    showDialog(
      "🎯 Hoàn thành nhiệm vụ!",
      "Bạn đã hoàn thành: " +
      island.quest +
      ". Phần thưởng: " +
      reward +
      " Beli và 50 EXP. Hãy khám phá hòn đảo tiếp theo!"
    );

    updateUI();
  }
}

// ---------- ĐIỀU KHIỂN ĐẢO ----------
function travelToIsland(index) {
  if (index < 0 || index >= islands.length) return;

  const island = islands[index];

  if (index > state.unlockedIslands - 1) {
    if (state.level < island.minLevel) {
      showDialog(
        "Chưa đủ cấp",
        "Bạn cần đạt cấp " + island.minLevel +
        " để đến " + island.name + "."
      );
      return;
    }

    if (state.beli < island.price) {
      showDialog(
        "Không đủ Beli",
        "Bạn cần " + island.price +
        " Beli để mở khóa " + island.name + "."
      );
      return;
    }

    state.beli -= island.price;
    state.unlockedIslands = index + 1;
  }

  if (state.level < island.minLevel) {
    showDialog(
      "Đảo quá nguy hiểm",
      "Bạn cần đạt cấp " + island.minLevel +
      " để đến " + island.name + "."
    );
    return;
  }

  state.islandIndex = index;
  state.questProgress = 0;
  state.questCompleted = false;

  state.player.x = canvas.width / 2;
  state.player.y = canvas.height / 2;

  spawnEnemies();
  updateUI();
  renderIslandList();
  closeModal("mapPanel");

  logMessage("Bạn đã đến " + island.name + "!");

  showDialog(
    "Chào mừng đến " + island.name,
    island.description +
    "\n\nNhiệm vụ mới: " + island.quest + "."
  );
}

// ---------- HIỂN THỊ BẢN ĐỒ ----------
function renderIslandList() {
  const list = getElement("islandList");
  if (!list) return;

  list.replaceChildren();

  islands.forEach((island, index) => {
    const unlocked = index < state.unlockedIslands;
    const current = index === state.islandIndex;

    const button = document.createElement("button");
    button.type = "button";

    button.style.display = "block";
    button.style.width = "100%";
    button.style.margin = "8px 0";
    button.style.padding = "10px";
    button.style.textAlign = "left";
    button.style.borderRadius = "10px";
    button.style.border = current
      ? "2px solid #ffd24a"
      : "1px solid #777";

    button.style.background = current
      ? "#394d37"
      : "#26352a";

    button.style.color = "#ffffff";

    let status = "🔒 Cần cấp " + island.minLevel;

    if (current) {
      status = "📍 Đang ở đây";
    } else if (unlocked) {
      status = "✅ Đã mở khóa";
    } else {
      status =
        "🔒 Cấp " + island.minLevel +
        " • " + island.price + " Beli";
    }

    button.textContent =
      island.name + " — " + status;

    button.addEventListener("click", () => {
      travelToIsland(index);
    });

    list.appendChild(button);
  });
}

// ---------- TƯƠNG TÁC ----------
function interact() {
  const nearbyEnemy = state.enemies.find(enemy =>
    enemy.alive && distance(enemy, state.player) < 70
  );

  if (nearbyEnemy) {
    normalAttack();
    return;
  }

  showDialog(
    "Người dân trên đảo",
    "Chào hải tặc! Hãy đánh bại kẻ địch để kiếm Beli và EXP. Hoàn thành nhiệm vụ để nhận thưởng. Dùng bản đồ để đi đến các hòn đảo mới."
  );
}

// ---------- MUA TRÁI ÁC QUỶ ----------
function buyFruit() {
  const choices = [
    {
      id: "gomu",
      price: 500,
      name: "Gomu Gomu no Mi"
    },
    {
      id: "mera",
      price: 1000,
      name: "Mera Mera no Mi"
    },
    {
      id: "ma
