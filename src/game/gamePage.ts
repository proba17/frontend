import { getLevel, saveResult } from '../api/client';
import { navigate } from '../main';
import type { Level } from '../types';

interface Packet {
  id: number;
  x: number;
  y: number;
  pathIndex: number;
  speed: number;
  path: Array<{ x: number; y: number }>;

  protocol: string;
  attack: string | null;
attackType?: string | null;
  sourceIp: string;
  destinationIp: string;

  sourcePort: number;
  destinationPort: number;

  tcpFlags: string | null;
  connectionState: string | null;

  packetRate: number | null;
  domain: string | null;
  applicationProtocol: string | null;

  httpMethod: string | null;
  url: string | null;
  payload: string | null;
  signature: string | null;

  osiLevel: number;
  isMalicious: boolean;

  isSuspicious: boolean;
  explanation: string;

  damage: number;
  health: number;
  maxHealth: number;
  reward: number;

  reachedBase: boolean;
  destroyed: boolean;
  country?: string;

isProxy?: boolean;
isBotnet?: boolean;
senderEmail?: string | null;
}

interface Tower {
  id: number;

  name: string;
  moduleCode: string;

  osiLevel: number;

  analyzes: string[];
  blocks: string[];

  x: number;
  y: number;

  damage: number;
  range: number;

  type: string;
  cost: number;

  level: number;
  upgradeCost: number;

  lastShotTime: number;
}

interface ShotEffect {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  createdAt: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  createdAt: number;
}

interface RouteParams {
  levelId?: number;
}

const DEFAULT_PATH = [
  { x: 0, y: 250 },
  { x: 130, y: 250 },
  { x: 220, y: 150 },
  { x: 380, y: 150 },
  { x: 470, y: 310 },
  { x: 650, y: 310 },
  { x: 770, y: 220 },
  { x: 860, y: 220 },
];

const DEFAULT_BASE = { x: 860, y: 220 };

export async function renderGamePage(
  app: HTMLDivElement,
  params: RouteParams = {}
): Promise<void> {
  const levelId = Number(params.levelId);

  if (!levelId) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка</h1>
          <p class="error">Уровень не выбран.</p>
          <button class="button" id="backButton">Назад к уровням</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
      navigate('levels');
    });

    return;
  }

  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Загрузка уровня...</h1>
        <p>Получаем конфигурацию карты, волн и защитных модулей.</p>
      </div>
    </div>
  `;

  try {
    const level = await getLevel(levelId);
    renderLevelPreview(app, level);
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки уровня</h1>
          <p class="error">${(error as Error).message}</p>
          <button class="button" id="backButton">Назад к уровням</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
      navigate('levels');
    });
  }
}

function renderLevelPreview(app: HTMLDivElement, level: Level): void {
  const threats = getThreatSummary(level);
  const recommendedModules = getRecommendedDefenseModules(level);
  const waves = level.waves_config || [];
  const modules = level.defense_config || [];

  app.innerHTML = `
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-logo"></div>
          <div>
            <div class="brand-title">${level.title}</div>
            <div class="brand-subtitle">${level.campaign || 'Кампания'} · ${level.difficulty}</div>
          </div>
        </div>

        <div class="nav-actions">
          <button class="button secondary" id="backButton">Назад к уровням</button>
        </div>
      </div>

      <div class="card hero">
        <div>
          <div class="hero-kicker">🛡️ Подготовка к уровню</div>
          <h1 class="glow-text">${level.title}</h1>
          <p>${level.description || 'Описание уровня отсутствует.'}</p>
          <p><b>Тема:</b> ${level.topic || 'не указана'} · <b>Сложность:</b> ${level.difficulty}</p>
          <button class="button" id="startButton">Начать уровень</button>
        </div>

        <div class="hero-panel">
          <div class="hero-line"></div>
          <div class="hero-node"></div>
          <div class="hero-node"></div>
          <div class="hero-node"></div>
        </div>
      </div>

      <div class="card">
        <h2>Анализ уровня</h2>
        <div class="grid">
          <div class="mini-card">
            <h3>Здоровье базы</h3>
            <p><b>${level.base_health}</b></p>
          </div>
          <div class="mini-card">
            <h3>Стартовые ресурсы</h3>
            <p><b>${level.start_resources}</b></p>
          </div>
          <div class="mini-card">
            <h3>Типы угроз</h3>
            <p>${threats.length === 0 ? 'Только обычный трафик.' : threats.map(item => `<span class="badge">${item}</span>`).join(' ')}</p>
          </div>
          <div class="mini-card recommended-card">
            <h3>Рекомендуемая защита</h3>
            <p>${recommendedModules.map(item => `<span class="badge recommended">${item}</span>`).join(' ')}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Какие параметры пакетов будут доступны</h2>
        <div class="grid">
          <div class="mini-card">
            <h3>IP-адреса</h3>
            <p>Пользователь видит адрес источника и адрес назначения пакета.</p>
          </div>
          <div class="mini-card">
            <h3>Порты</h3>
            <p>Порт помогает определить, к какой службе относится пакет: HTTP, DNS, HTTPS и другие.</p>
          </div>
          <div class="mini-card">
            <h3>TCP-флаги</h3>
            <p>Для TCP-пакетов отображаются флаги SYN, ACK, FIN и другие признаки.</p>
          </div>
          <div class="mini-card">
            <h3>Пояснение</h3>
            <p>Для каждого пакета показывается объяснение, почему он обычный или подозрительный.</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Волны трафика</h2>
        <div class="grid">
          ${waves.map(wave => `
            <div class="mini-card">
              <div class="badge">Волна ${String(wave.wave || '-')}</div>
              <h3>${String(wave.attack || wave.protocol || 'Трафик')}</h3>
              <p><b>Протокол:</b> ${String(wave.protocol || '-')}</p>
              <p><b>Тип:</b> ${String(wave.packet_type || '-')}</p>
              <p><b>Количество:</b> ${String(wave.count || 0)}</p>
              <p><b>Скорость:</b> ${String(wave.speed || 1)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h2>Доступные защитные модули</h2>
        <div class="grid">
          ${modules.map(module => `
            <div class="mini-card">
              <div class="achievement-icon">${getModuleIcon(String(module.type || 'basic'))}</div>
              <h3>${String(module.name || 'Модуль')}</h3>
              <p>${String(module.description || '')}</p>
              <p><b>Цена:</b> ${Number(module.cost || 0)}</p>
              <p><b>Урон:</b> ${Number(module.damage || 1)} · <b>Радиус:</b> ${Number(module.range || 120)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
    navigate('levels');
  });

  document.querySelector<HTMLButtonElement>('#startButton')?.addEventListener('click', () => {
  renderGameTutorial(app, level);
});
}

function renderGameTutorial(app: HTMLDivElement, level: Level): void {
  const threats = getThreatSummary(level);
  const recommendedModules = getRecommendedDefenseModules(level);

  app.innerHTML = `
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-logo"></div>
          <div>
            <div class="brand-title">Туториал перед уровнем</div>
            <div class="brand-subtitle">${level.title}</div>
          </div>
        </div>

        <div class="nav-actions">
          <button class="button secondary" id="backToPreviewButton">Назад к описанию</button>
          <button class="button" id="startRealGameButton">Начать игру</button>
        </div>
      </div>

      <div class="card hero">
        <div>
          <div class="hero-kicker">🎮 Как пройти уровень</div>
          <h1 class="glow-text">Перед началом защиты</h1>
          <p>
            В этом уровне нужно не просто уничтожать все пакеты, а правильно отличать
            обычный трафик от вредоносного.
          </p>
          <p>
            Обычные пакеты должны доходить до сервера, а атаки нужно блокировать
            подходящими защитными модулями.
          </p>
        </div>

        <div class="hero-panel">
          <div class="hero-line"></div>
          <div class="hero-node"></div>
          <div class="hero-node"></div>
          <div class="hero-node"></div>
        </div>
      </div>

      <div class="card">
        <h2>Главные правила</h2>

        <div class="tutorial-steps">
          <div class="tutorial-step">
            <div class="tutorial-number">1</div>
            <div>
              <h3>Анализируйте пакеты</h3>
              <p>
                Нажмите по пакету на игровом поле, чтобы увидеть протокол, IP-адрес источника,
                порт, TCP-флаги, тип атаки и пояснение.
              </p>
            </div>
          </div>

          <div class="tutorial-step">
            <div class="tutorial-number">2</div>
            <div>
              <h3>Пропускайте обычный трафик</h3>
              <p>
                Если обычный пакет дошёл до сервера — это правильное действие.
                За это увеличивается показатель разрешённого нормального трафика.
              </p>
            </div>
          </div>

          <div class="tutorial-step">
            <div class="tutorial-number">3</div>
            <div>
              <h3>Блокируйте вредоносный трафик</h3>
              <p>
                Если атака дошла до сервера, база получает урон.
                Размещайте защитные модули так, чтобы они успевали блокировать угрозы.
              </p>
            </div>
          </div>

          <div class="tutorial-step">
            <div class="tutorial-number">4</div>
            <div>
              <h3>Не блокируйте всё подряд</h3>
              <p>
                Уничтожение обычного пакета считается ложным срабатыванием.
                Это снижает качество фильтрации и ухудшает итоговый результат.
              </p>
            </div>
          </div>

          <div class="tutorial-step">
            <div class="tutorial-number">5</div>
            <div>
              <h3>Выбирайте подходящий модуль</h3>
              <p>
                Разные модули эффективны против разных угроз: SYN-защита против SYN Flood,
                DPI против вредоносной нагрузки, Rate Limiter против flood-атак.
              </p>
            </div>
          </div>

          <div class="tutorial-step">
            <div class="tutorial-number">6</div>
            <div>
              <h3>Ставьте модули рядом с маршрутом</h3>
              <p>
                Защитные модули нельзя ставить прямо на дороге пакетов.
                При выборе модуля на карте отображается радиус действия.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Что будет в этом уровне</h2>

        <div class="grid">
          <div class="mini-card">
            <h3>Угрозы</h3>
            <p>
              ${
                threats.length === 0
                  ? 'В уровне нет явно заданных атак, будет обычный сетевой трафик.'
                  : threats.map(item => `<span class="badge">${item}</span>`).join(' ')
              }
            </p>
          </div>

          <div class="mini-card recommended-card">
            <h3>Рекомендуемые модули</h3>
            <p>
              ${recommendedModules.map(item => `<span class="badge recommended">${item}</span>`).join(' ')}
            </p>
          </div>

          <div class="mini-card">
            <h3>Цель</h3>
            <p>
              Сохранить здоровье сервера, блокировать угрозы и не мешать нормальному трафику.
            </p>
          </div>

          <div class="mini-card">
            <h3>Оценка</h3>
            <p>
              Итог зависит от точности классификации, правильных блокировок,
              ложных срабатываний, пропущенных угроз и времени прохождения.
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Быстрая памятка</h2>

        <div class="tutorial-cheatsheet">
          <div>
            <b>Обычный пакет дошёл до сервера</b>
            <span>Правильный пропуск</span>
          </div>

          <div>
            <b>Атака заблокирована</b>
            <span>Правильная блокировка</span>
          </div>

          <div>
            <b>Обычный пакет заблокирован</b>
            <span>Ложное срабатывание</span>
          </div>

          <div>
            <b>Атака дошла до сервера</b>
            <span>Пропущенная угроза и урон базе</span>
          </div>
        </div>
      </div>

      <div class="card tutorial-actions-card">
        <button class="button secondary" id="backToPreviewButtonBottom">Назад к описанию</button>
        <button class="button" id="startRealGameButtonBottom">Начать игру</button>
      </div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#backToPreviewButton')?.addEventListener('click', () => {
    renderLevelPreview(app, level);
  });

  document.querySelector<HTMLButtonElement>('#backToPreviewButtonBottom')?.addEventListener('click', () => {
    renderLevelPreview(app, level);
  });

  document.querySelector<HTMLButtonElement>('#startRealGameButton')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    startGame(app, level);
  });

  document.querySelector<HTMLButtonElement>('#startRealGameButtonBottom')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    startGame(app, level);
  });
}

type TowerUpgradeRule = {
  level: number;
  analyze: string;
  block: string;
};

const TOWER_UPGRADE_RULES: Record<string, TowerUpgradeRule[]> = {
  router_acl: [
    {
      level: 2,
      analyze: 'ICMP Filtering',
      block: 'icmp_flood',
    },
    {
      level: 3,
      analyze: 'Source IP Validation',
      block: 'ip_spoofing',
    },
    {
      level: 4,
      analyze: 'Blocked IP List',
      block: 'blocked_ip',
    },
  ],

  stateful_firewall: [
    {
      level: 2,
      analyze: 'TCP Flags',
      block: 'syn_flood',
    },
    {
      level: 3,
      analyze: 'Connection State',
      block: 'port_scan',
    },
    {
      level: 4,
      analyze: 'Port Policy',
      block: 'unauthorized_port',
    },
  ],

  anti_ddos: [
    {
      level: 2,
      analyze: 'UDP Rate',
      block: 'udp_flood',
    },
    {
      level: 2,
      analyze: 'ICMP Rate',
      block: 'icmp_flood',
    },
    {
      level: 3,
      analyze: 'TCP Connection Rate',
      block: 'syn_flood',
    },
    {
      level: 3,
      analyze: 'HTTP Request Rate',
      block: 'http_flood',
    },
    {
      level: 4,
      analyze: 'Distributed Traffic Pattern',
      block: 'botnet',
    },
  ],

  snort_ips: [
    {
      level: 2,
      analyze: 'Exploit Signature',
      block: 'known_exploit',
    },
    {
      level: 2,
      analyze: 'Malware Signature',
      block: 'malware_traffic',
    },
    {
      level: 3,
      analyze: 'Scan Signature',
      block: 'port_scan',
    },
    {
      level: 3,
      analyze: 'Payload Analysis',
      block: 'sql_injection',
    },
    {
      level: 4,
      analyze: 'Botnet Indicators',
      block: 'botnet',
    },
  ],

  dns_filter: [
    {
      level: 2,
      analyze: 'Domain Reputation',
      block: 'malicious_domain',
    },
    {
      level: 3,
      analyze: 'DNS Behavior',
      block: 'dns_tunneling',
    },
    {
      level: 3,
      analyze: 'Command and Control Domain',
      block: 'c2_domain',
    },
    {
      level: 4,
      analyze: 'Botnet DNS Activity',
      block: 'botnet',
    },
  ],

  waf: [
    {
      level: 2,
      analyze: 'SQL Patterns',
      block: 'sql_injection',
    },
    {
      level: 2,
      analyze: 'Script Payload',
      block: 'xss',
    },
    {
      level: 3,
      analyze: 'Path Validation',
      block: 'path_traversal',
    },
    {
      level: 3,
      analyze: 'HTTP Request Rate',
      block: 'http_flood',
    },
    {
      level: 4,
      analyze: 'Exploit Payload',
      block: 'known_exploit',
    },
  ],

  email_gateway: [
    {
      level: 2,
      analyze: 'Suspicious Links',
      block: 'phishing',
    },
    {
      level: 2,
      analyze: 'Spam Pattern',
      block: 'spam',
    },
    {
      level: 3,
      analyze: 'Attachment Scan',
      block: 'malware_attachment',
    },
    {
      level: 4,
      analyze: 'Malicious Mail Domain',
      block: 'malicious_domain',
    },
  ],
};



function applyTowerUpgradeRules(tower: Tower): void {
  const rules = TOWER_UPGRADE_RULES[tower.moduleCode] || [];

  for (const rule of rules) {
    if (rule.level === tower.level) {
      addTowerRule(tower, rule.analyze, rule.block);
    }
  }
}

function startGame(app: HTMLDivElement, level: Level): void {
const paths = getLevelPaths(level);
  const base = level.map_config?.base || DEFAULT_BASE;
  const modules = level.defense_config || [];
  const waves = level.waves_config || [];

  renderRunningGame(app, level);

  
  const canvasElement = document.querySelector<HTMLCanvasElement>('#gameCanvas');

if (!canvasElement) {
  return;
}

const context = canvasElement.getContext('2d');

if (!context) {
  return;
}

const canvas: HTMLCanvasElement = canvasElement;
const ctx: CanvasRenderingContext2D = context;

  const packets: Packet[] = [];
  const towers: Tower[] = [];
  const shotEffects: ShotEffect[] = [];
  const floatingTexts: FloatingText[] = [];

  let packetIdCounter = 1;
  let towerIdCounter = 1;
  let selectedModuleIndex: number | null = null;
  let selectedTowerId: number | null = null;

  let mouseX = 0;
let mouseY = 0;
let isMouseOnCanvas = false;
  let baseHealth = level.base_health;
  let resources = level.start_resources;
  let destroyed = 0;
  let missed = 0;
  let correctBlocks = 0;
  let falsePositives = 0;
  let allowedNormalTraffic = 0;

  let currentWaveIndex = 0;
  let spawnedInWave = 0;
  let lastSpawnTime = 0;

  let isFinished = false;
  let isPaused = false;
  let pauseStartedAt = 0;
  let totalPausedTime = 0;
  const startedAt = Date.now();

  let gameSpeed = 1;
  let animationId = 0;

  function setText(selector: string, value: string | number): void {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = String(value);
    }
  }

  function updateHud(): void {
  const currentWave = waves[currentWaveIndex];
  const visibleWaveNumber = Math.min(currentWaveIndex + 1, Math.max(waves.length, 1));
  const currentWaveCount = Number(currentWave?.count || 0);

  setText('#baseHealth', Math.max(0, baseHealth));
  setText('#resources', resources);
  setText('#destroyed', destroyed);
  setText('#missed', missed);
  setText('#correctBlocks', correctBlocks);
  setText('#falsePositives', falsePositives);
  setText('#allowedNormalTraffic', allowedNormalTraffic);

  setText('#waveInfo', `${visibleWaveNumber}/${waves.length}`);
  setText('#wavePackets', `${spawnedInWave}/${currentWaveCount}`);

  const currentWaveName = document.querySelector<HTMLDivElement>('#currentWaveName');

  if (currentWaveName) {
    if (!currentWave) {
      currentWaveName.textContent = 'Все волны завершены. Ожидаем завершения движения пакетов.';
      return;
    }

    const protocol = String(currentWave.protocol || 'Трафик');
    const attack = String(currentWave.attack || 'обычный трафик');
    const packetType = String(currentWave.packet_type || 'normal');

    currentWaveName.textContent = `Текущая волна: ${protocol} · ${attack} · ${packetType}`;
  }
}

  function getCanvasPoint(event: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function findPacketAtPoint(x: number, y: number): Packet | null {
    for (const packet of packets) {
      if (packet.destroyed || packet.reachedBase) {
        continue;
      }

      const dx = packet.x - x;
      const dy = packet.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 20) {
        return packet;
      }
    }

    return null;
  }

  function findTowerAtPoint(x: number, y: number): Tower | null {
    for (const tower of towers) {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 22) {
        return tower;
      }
    }

    return null;
  }

  function showPacketInfo(packet: Packet | null): void {
    const packetInfo = document.querySelector<HTMLDivElement>('#packetInfo');

    if (!packetInfo) {
      return;
    }

    if (!packet) {
      packetInfo.innerHTML = `
        <b>Пакет не выбран.</b><br>
        Нажмите по пакету на карте, чтобы увидеть параметры.
      `;
      return;
    }

    packetInfo.innerHTML = `
      <b>Пакет #${packet.id}</b><br>
      Протокол: <b>${packet.protocol}</b><br>
      IP источника: <b>${packet.sourceIp}</b><br>
      IP назначения: <b>${packet.destinationIp}</b><br>
      Порт: <b>${packet.destinationPort === 0 ? 'не используется' : packet.destinationPort}</b><br>
      TCP-флаги: <b>${packet.tcpFlags || 'не применимо'}</b><br>
      Тип: <b>${packet.isMalicious ? 'Вредоносный трафик' : 'Обычный трафик'}</b><br>
      Признак подозрительности: <b>${packet.isSuspicious ? 'да' : 'нет'}</b><br>
      Атака: <b>${packet.attack || 'нет'}</b><br>
      Здоровье: <b>${packet.health}/${packet.maxHealth}</b><br>
      Урон при достижении базы: <b>${packet.isMalicious ? packet.damage : 0}</b><br>
      Награда за блокировку: <b>${packet.isMalicious ? packet.reward : 0}</b> ресурсов<br>
      <br>
      <b>Пояснение:</b><br>
      ${packet.explanation}
    `;
  }

  function showTowerInfo(tower: Tower | null): void {
    const towerInfo = document.querySelector<HTMLDivElement>('#towerInfo');

    if (!towerInfo) {
      return;
    }

    if (!tower) {
      selectedTowerId = null;
      towerInfo.innerHTML = `
        <b>Башня не выбрана.</b><br>
        Нажмите по установленному защитному модулю.
      `;
      return;
    }

    selectedTowerId = tower.id;

   towerInfo.innerHTML = `
    <b>${tower.name}</b><br>
    Уровень: <b>${tower.level}</b><br>
Тип: <b>${getModuleDisplayName(tower.moduleCode)}</b>    Урон: <b>${tower.damage}</b><br>
    Радиус: <b>${tower.range}</b><br>
    Стоимость улучшения: <b>${tower.upgradeCost}</b> ресурсов<br>
    Возврат при удалении: <b>${Math.floor(tower.cost * 0.5)}</b> ресурсов<br>
    <p>
  <b>Анализирует:</b><br>
  ${tower.analyzes.join(', ')}
</p>

<p>
  <b>Блокирует:</b><br>
  ${tower.blocks.join(', ')}
</p>
    <div class="tower-actions">
      <button class="button small" id="upgradeTowerButton">Улучшить</button>
      <button class="button danger small" id="deleteTowerButton">Удалить</button>
    </div>
  `;

    document.querySelector<HTMLButtonElement>('#upgradeTowerButton')?.addEventListener('click', () => {
      upgradeSelectedTower();
    });

    document.querySelector<HTMLButtonElement>('#deleteTowerButton')?.addEventListener('click', () => {
     deleteSelectedTower();
    });
  }

  function getModuleDisplayName(
  code: string
): string {

  switch (code) {

    case 'router_acl':
      return 'ACL маршрутизатора';

    case 'stateful_firewall':
      return 'Межсетевой экран с контролем состояния';

    case 'anti_ddos':
      return 'Anti-DDoS система';

    case 'snort_ips':
      return 'Система предотвращения вторжений';

    case 'dns_filter':
      return 'DNS-фильтр';

    case 'waf':
      return 'Web Application Firewall';

    case 'email_gateway':
      return 'Почтовый шлюз безопасности';

    default:
      return code;
  }
}

function deleteSelectedTower(): void {
  if (isPaused || isFinished) {
    return;
  }

  if (selectedTowerId === null) {
    return;
  }

  const towerIndex = towers.findIndex(item => item.id === selectedTowerId);

  if (towerIndex === -1) {
    return;
  }

  const tower = towers[towerIndex];
  const refund = Math.floor(tower.cost * 0.5);

  const confirmed = confirm(
    `Удалить модуль "${tower.name}"? Будет возвращено ${refund} ресурсов.`
  );

  if (!confirmed) {
    return;
  }

  resources += refund;
  towers.splice(towerIndex, 1);
  selectedTowerId = null;

  updateHud();
  showTowerInfo(null);
  draw();

  const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

  if (selectedModuleInfo) {
    selectedModuleInfo.textContent = `Модуль удалён. Возвращено ${refund} ресурсов.`;
  }
}

 function upgradeSelectedTower(): void {
  if (isPaused || isFinished) {
    return;
  }

  if (selectedTowerId === null) {
    return;
  }

  const tower = towers.find(item => item.id === selectedTowerId);

  if (!tower) {
    return;
  }

  if (tower.level >= 4) {
    const towerInfo = document.querySelector<HTMLDivElement>('#towerInfo');

    if (towerInfo) {
      towerInfo.innerHTML += '<p class="error">Модуль уже имеет максимальный уровень.</p>';
    }

    return;
  }

  if (resources < tower.upgradeCost) {
    const towerInfo = document.querySelector<HTMLDivElement>('#towerInfo');

    if (towerInfo) {
      towerInfo.innerHTML += '<p class="error">Недостаточно ресурсов для улучшения.</p>';
    }

    return;
  }

  resources -= tower.upgradeCost;
  tower.level += 1;


applyTowerUpgradeRules(tower);

  tower.damage += 1;
  tower.range += 15;
  tower.upgradeCost = Math.round(tower.upgradeCost * 1.5);

  updateHud();
  showTowerInfo(tower);
}

  function distanceToSegment(
    pointX: number,
    pointY: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): number {
    const dx = endX - startX;
    const dy = endY - startY;

    if (dx === 0 && dy === 0) {
      return Math.sqrt((pointX - startX) ** 2 + (pointY - startY) ** 2);
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((pointX - startX) * dx + (pointY - startY) * dy) / (dx * dx + dy * dy)
      )
    );

    const nearestX = startX + t * dx;
    const nearestY = startY + t * dy;

    return Math.sqrt((pointX - nearestX) ** 2 + (pointY - nearestY) ** 2);
  }

  function isPointOnPath(x: number, y: number): boolean {
  const forbiddenDistance = 32;

  for (const currentPath of paths) {
    for (let i = 0; i < currentPath.length - 1; i += 1) {
      const start = currentPath[i];
      const end = currentPath[i + 1];
      const distance = distanceToSegment(x, y, start.x, start.y, end.x, end.y);

      if (distance <= forbiddenDistance) {
        return true;
      }
    }
  }

  return false;
}

  function isTooCloseToTower(x: number, y: number): boolean {
    const minDistance = 45;

    return towers.some(tower => {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < minDistance;
    });
  }

  function spawnPacket(time: number): void {
    const wave = waves[currentWaveIndex];

    if (!wave) {
      return;
    }

    const count = Number(wave.count || 0);
    const spawnDelay = (Number(wave.spawn_delay || 1) * 1000) / gameSpeed;

    if (spawnedInWave >= count) {
      currentWaveIndex += 1;
      spawnedInWave = 0;
      lastSpawnTime = time;
        updateHud();
      return;
    }

    if (time - lastSpawnTime < spawnDelay) {
      return;
    }

const packetPath = paths[Math.floor(Math.random() * paths.length)];
const start = packetPath[0];
    const isAttack = String(wave.packet_type) === 'attack';
    const packetHealth = isAttack ? 3 : 1;
    const packetReward = isAttack ? 10 : 0;

    const protocol = String(wave.protocol || 'TCP');
    const attack = wave.attack ? String(wave.attack) : null;
    const sourceIp = generateIpAddress(isAttack || attack === 'IP Spoofing');
    const destinationIp = getDestinationIp();
    const explanation = getPacketExplanation(protocol, attack, isAttack);
const isMalicious =
  Boolean((wave as any).is_malicious) ||
  String(wave.packet_type) === 'attack';

const attackType =
  (wave as any).attack_type
    ? String((wave as any).attack_type)
    : null;
    const domain =
  attackType === 'malicious_domain'
    ? 'evil-malware.com'
    :attackType === 'c2_domain'
      ? 'botnet-command.net'
      : null;

const httpMethod =
  attackType === 'sql_injection' ||
  attackType === 'xss' ||
  attackType === 'path_traversal'
    ? 'POST'
    : null;

const url =
  attackType === 'sql_injection'
    ? '/login?id=1 OR 1=1'
    : attackType === 'xss'
      ? '/search?q=<script>alert(1)</script>'
      : attackType === 'path_traversal'
        ? '/download?file=../../windows/system32'
        : null;

const senderEmail =
  attackType === 'phishing'
    ? 'support@paypa1-security.com'
    : null;

const destinationPort = getPacketPort(protocol, attack);
const sourcePort = Math.floor(Math.random() * 50000) + 1024;

const tcpFlags = getTcpFlags(protocol, attack);

const osiLevel = Number((wave as any).osi_level || 3);

const payload =
  attackType === 'malicious_payload'
    ? '<script>alert(1)</script>'

    :attackType === 'sql_injection'
      ? "' OR 1=1 --"

    : attackType === 'xss'
      ? '<script>alert("xss")</script>'

    :attackType === 'dns_tunneling'
      ? 'ZXhhbXBsZS5kYXRhLmV4Zmls'

    :attackType === 'malware_attachment'
      ? 'invoice.exe'

    : null;

const signature =
  attack
    ? attack.toUpperCase().replaceAll(' ', '_')
    : null;
    
    packets.push({
  id: packetIdCounter,
  x: start.x,
  y: start.y,

  pathIndex: 1,
  speed: Number(wave.speed || 1),
  path: packetPath,

  protocol,
  attack,
  attackType,
isProxy:
  attackType === 'proxy_attack',

isBotnet:
  attackType?.includes('botnet'),
  sourceIp,
  destinationIp,

  sourcePort,
  destinationPort,

  tcpFlags,
  connectionState: null,

packetRate:
  attackType === 'syn_flood'
    ? 300
    : 10,
      domain,

applicationProtocol:

attackType === 'sql_injection' ||
  attackType === 'xss' ||
  attackType === 'path_traversal'
    ? 'HTTP'

  : attackType === 'malicious_domain' ||
    attackType === 'dns_tunneling' ||
    attackType === 'c2_domain'
      ? 'DNS'

  : protocol,

  httpMethod,
  url,
  senderEmail,
  payload,
  signature,

  osiLevel,
  isMalicious,

  isSuspicious: isMalicious,
  explanation,

  damage: Number(wave.damage || 5),

  health: packetHealth,
  maxHealth: packetHealth,
  reward: packetReward,

  reachedBase: false,
  destroyed: false,
});

    packetIdCounter += 1;
    spawnedInWave += 1;
    lastSpawnTime = time;

    updateHud();
  }

  function updatePackets(): void {
    for (const packet of packets) {
      if (packet.destroyed || packet.reachedBase) {
        continue;
      }

const target = packet.path[packet.pathIndex];

      if (!target) {
        packet.reachedBase = true;

        if (packet.isMalicious) {
          baseHealth -= packet.damage;
          missed += 1;
        } else {
          allowedNormalTraffic += 1;
        }

        updateHud();
        continue;
      }

      const dx = target.x - packet.x;
      const dy = target.y - packet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveSpeed = packet.speed * gameSpeed;

      if (distance < moveSpeed) {
        packet.x = target.x;
        packet.y = target.y;
        packet.pathIndex += 1;
      } else {
        packet.x += (dx / distance) * moveSpeed;
        packet.y += (dy / distance) * moveSpeed;
      }
    }
  }

  function getTowerEffectiveness(
  tower: Tower,
  packet: Packet
): number {
  if (tower.level < 2) {
    return 0;
  }

  if (!packet.isMalicious) {
    return 0;
  }

  const packetTags = detectPacketTags(packet);

  const matchedRules = tower.blocks.filter(
    block => packetTags.includes(block.toLowerCase())
  );

  if (matchedRules.length === 0) {
    return 0;
  }

  if (tower.moduleCode === 'stateful_firewall') {
    return 1.2;
  }

  if (tower.moduleCode === 'snort_ips') {
    return 1.5;
  }

  if (tower.moduleCode === 'waf') {
    return 1.4;
  }

  return 1.0;
}


  function updateTowers(time: number): void {
    for (const tower of towers) {
      if (time - tower.lastShotTime < 500 / gameSpeed) {
        continue;
      }

      let target: Packet | null = null;
      let nearestDistance = Number.MAX_SAFE_INTEGER;

      for (const packet of packets) {
        if (packet.destroyed || packet.reachedBase) {
          continue;
        }

        const effectiveness = getTowerEffectiveness(tower, packet);

        if (effectiveness <= 0) {
          continue;
        }

        const dx = tower.x - packet.x;
        const dy = tower.y - packet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= tower.range && distance < nearestDistance) {
          target = packet;
          nearestDistance = distance;
        }
      }

      if (!target) {
        continue;
      }

      const effectiveness = getTowerEffectiveness(tower, target);

      shotEffects.push({
        fromX: tower.x,
        fromY: tower.y,
        toX: target.x,
        toY: target.y,
        createdAt: time,
      });

      target.health -= Math.max(1, Math.round(tower.damage * effectiveness));

      if (target.health <= 0) {
        target.destroyed = true;
        destroyed += 1;

        if (target.isMalicious) {
          correctBlocks += 1;
          resources += target.reward;
        } else {
          falsePositives += 1;
          resources = Math.max(0, resources - 5);
        }

        floatingTexts.push({
  x: target.x,
  y: target.y - 20,
  text: tower.name,
  createdAt: time,
});

        updateHud();
      }

      tower.lastShotTime = time;
    }
  }

  function updateShotEffects(time: number): void {
    for (let i = shotEffects.length - 1; i >= 0; i -= 1) {
      if (time - shotEffects[i].createdAt > 160) {
        shotEffects.splice(i, 1);
      }
    }
  }

  function updateFloatingTexts(time: number): void {
    for (let i = floatingTexts.length - 1; i >= 0; i -= 1) {
      const item = floatingTexts[i];

      if (time - item.createdAt > 700) {
        floatingTexts.splice(i, 1);
        continue;
      }

      item.y -= 0.4 * gameSpeed;
    }
  }

  function areAllWavesFinished(): boolean {
    const allWavesSpawned = currentWaveIndex >= waves.length;
    const allPacketsInactive = packets.every(packet => packet.destroyed || packet.reachedBase);

    return allWavesSpawned && allPacketsInactive;
  }

  function calculateAccuracy(): number {
    const correctDecisions = correctBlocks + allowedNormalTraffic;
    const totalDecisions = correctBlocks + allowedNormalTraffic + falsePositives + missed;

    if (totalDecisions === 0) {
      return 0;
    }

    return Math.round((correctDecisions / totalDecisions) * 100);
  }

  async function finishLevelAutomatically(): Promise<void> {
    if (isFinished) {
      return;
    }

    isFinished = true;
    cancelAnimationFrame(animationId);

    const currentPauseTime = isPaused && pauseStartedAt > 0
      ? Date.now() - pauseStartedAt
      : 0;

    const timeSpent = Math.floor(
      (Date.now() - startedAt - totalPausedTime - currentPauseTime) / 1000
    );

    const damageTaken = level.base_health - Math.max(0, baseHealth);
    const accuracy = calculateAccuracy();

    const score = Math.max(
      0,
      Math.max(0, baseHealth) * 5
      + correctBlocks * 25
      + allowedNormalTraffic * 5
      + accuracy * 3
      - missed * 25
      - falsePositives * 20
    );

    try {
      await saveResult({
        level_id: level.id,
        score,
        completed: baseHealth > 0 ? 1 : 0,
        enemies_destroyed: destroyed,
        damage_taken: damageTaken,
        time_spent: timeSpent,
        correct_blocks: correctBlocks,
        false_positives: falsePositives,
        allowed_normal_traffic: allowedNormalTraffic,
        accuracy,
      });
    } catch (error) {
      console.error('Ошибка сохранения результата:', error);
    }

    await showFinishScreen(score, timeSpent, baseHealth > 0);
  }

  async function showFinishScreen(score: number, timeSpent: number, isWin: boolean): Promise<void> {
    const damageTaken = level.base_health - Math.max(0, baseHealth);
    const accuracy = calculateAccuracy();

    const recommendation = getResultRecommendation(
      isWin,
      damageTaken,
      destroyed,
      missed,
      falsePositives,
      accuracy,
      allowedNormalTraffic
    );

const finishInfo = document.querySelector<HTMLDivElement>('#gameResultSide');

    if (finishInfo) {
  finishInfo.innerHTML = `
    <div class="result-panel ${isWin ? 'win' : 'lose'}">
      <div class="result-kicker">
        ${isWin ? '✅ Успешная защита' : '⚠️ Сервер перегружен'}
      </div>

      <h2>${isWin ? 'Уровень пройден' : 'Уровень не пройден'}</h2>

      <div class="result-score">
        ${score}
        <span>очков</span>
      </div>

      <div class="result-grid">
        <div>
          <span>Точность</span>
          <b>${accuracy}%</b>
        </div>

        <div>
          <span>Прав. блокировки</span>
          <b>${correctBlocks}</b>
        </div>

        <div>
          <span>Норм. трафик</span>
          <b>${allowedNormalTraffic}</b>
        </div>

        <div>
          <span>Ложные срабатывания</span>
          <b>${falsePositives}</b>
        </div>

        <div>
          <span>Пропущенные угрозы</span>
          <b>${missed}</b>
        </div>

        <div>
          <span>Урон</span>
          <b>${damageTaken}</b>
        </div>

        <div>
          <span>Время</span>
          <b>${timeSpent} сек.</b>
        </div>
      </div>

      <div class="result-recommendation">
        <b>Анализ:</b>
        <p>${recommendation}</p>
      </div>

      <div class="result-actions">
        <button class="button" id="restartLevelButton">Повторить уровень</button>
        <button class="button secondary" id="goLevelsButton">К уровням</button>
      </div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#restartLevelButton')?.addEventListener('click', () => {
    startGame(app, level);
  });

  document.querySelector<HTMLButtonElement>('#goLevelsButton')?.addEventListener('click', () => {
    navigate('levels');
  });

  drawFinishOverlay(isWin);
}


    
    const finishButton = document.querySelector<HTMLButtonElement>('#finishButton');

    if (finishButton) {
      finishButton.textContent = 'К уровням';
      finishButton.onclick = () => {
        navigate('levels');
      };
    }

    const pauseButton = document.querySelector<HTMLButtonElement>('#pauseButton');
    const speedButton = document.querySelector<HTMLButtonElement>('#speedButton');

    if (pauseButton) {
      pauseButton.disabled = true;
    }

    if (speedButton) {
      speedButton.disabled = true;
    }
  }

  function drawFinishOverlay(isWin: boolean): void {
  ctx.save();

  ctx.fillStyle = 'rgba(2, 6, 23, 0.62)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = isWin ? '#22c55e' : '#ef4444';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(
    isWin ? 'Уровень завершён' : 'База уничтожена',
    canvas.width / 2,
    canvas.height / 2 - 12
  );

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '18px Arial';

  ctx.fillText(
    'Подробный результат показан справа',
    canvas.width / 2,
    canvas.height / 2 + 34
  );

  ctx.restore();
}

  function draw(): void {
  drawBackground(ctx, canvas);
drawPaths(ctx, paths);
  drawBase(ctx, base, baseHealth, level.base_health);
  drawTowers(ctx, towers, selectedTowerId);

  drawPlacementPreview(
    ctx,
    selectedModuleIndex,
    modules,
    mouseX,
    mouseY,
    isMouseOnCanvas,
    isPointOnPath(mouseX, mouseY),
    isTooCloseToTower(mouseX, mouseY)
  );

  drawPackets(ctx, packets);
  drawShotEffects(ctx, shotEffects);
  drawFloatingTexts(ctx, floatingTexts);
}

  function loop(time: number): void {
    try {
      if (isFinished) {
        return;
      }

      if (isPaused) {
        draw();
        drawPauseOverlay(ctx, canvas);
        animationId = requestAnimationFrame(loop);
        return;
      }

      spawnPacket(time);
      updatePackets();
      updateTowers(time);
      updateShotEffects(time);
      updateFloatingTexts(time);
      draw();

      if (baseHealth <= 0) {
        finishLevelAutomatically();
        return;
      }

      if (areAllWavesFinished()) {
        finishLevelAutomatically();
        return;
      }

      animationId = requestAnimationFrame(loop);
    } catch (error) {
      console.error('Ошибка игрового цикла:', error);
    }
  }

  document.querySelectorAll<HTMLButtonElement>('.tower-select-button').forEach(button => {
    button.addEventListener('click', () => {
            if (isPaused || isFinished) {
        return;
      }
      selectedModuleIndex = Number(button.dataset.moduleIndex);
canvas.style.cursor = 'crosshair';
      document.querySelectorAll<HTMLButtonElement>('.tower-select-button').forEach(item => {
        item.classList.remove('selected');
      });

      button.classList.add('selected');

      const module = modules[selectedModuleIndex];
      const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

      if (selectedModuleInfo) {
        selectedModuleInfo.textContent = `Выбран модуль: ${String(module.name || 'Модуль')}. Нажмите на поле, чтобы установить.`;
      }
    });
  });

document.querySelector<HTMLButtonElement>('#pauseButton')?.addEventListener('click', event => {
  const pauseButton = event.currentTarget as HTMLButtonElement;
  isPaused = !isPaused;

  if (isPaused) {
    pauseStartedAt = Date.now();
    pauseButton.textContent = 'Продолжить';

    selectedModuleIndex = null;
    canvas.style.cursor = 'default';

    document.querySelectorAll<HTMLButtonElement>('.tower-select-button').forEach(item => {
      item.classList.remove('selected');
      item.disabled = true;
    });

    const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

    if (selectedModuleInfo) {
      selectedModuleInfo.textContent = 'Игра на паузе. Можно нажимать на пакеты и башни для просмотра информации.';
    }
  } else {
    totalPausedTime += Date.now() - pauseStartedAt;
    pauseStartedAt = 0;
    pauseButton.textContent = 'Пауза';

    document.querySelectorAll<HTMLButtonElement>('.tower-select-button').forEach(item => {
      item.disabled = false;
    });

    const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

    if (selectedModuleInfo) {
      selectedModuleInfo.textContent = 'Выберите защитный модуль и установите его рядом с маршрутом.';
    }
  }
});

document.querySelector<HTMLButtonElement>('#speedButton')?.addEventListener('click', event => {
  const speedButton = event.currentTarget as HTMLButtonElement;

  if (gameSpeed === 1) {
    gameSpeed = 2;
    speedButton.textContent = 'x2';
    return;
  }

  gameSpeed = 1;
  speedButton.textContent = 'x1';
});

  document.querySelector<HTMLButtonElement>('#finishButton')?.addEventListener('click', () => {
    cancelAnimationFrame(animationId);
    navigate('levels');
  });

  canvas.addEventListener('mousemove', event => {
  const point = getCanvasPoint(event);

  mouseX = point.x;
  mouseY = point.y;
  isMouseOnCanvas = true;
});

canvas.addEventListener('mouseleave', () => {
  isMouseOnCanvas = false;
});

canvas.addEventListener('click', event => {
  if (isFinished) {
    return;
  }

  const point = getCanvasPoint(event);

  if (isPaused) {
    const packet = findPacketAtPoint(point.x, point.y);

    if (packet) {
      showPacketInfo(packet);
      return;
    }

    const tower = findTowerAtPoint(point.x, point.y);

    if (tower) {
      showTowerInfo(tower);
      return;
    }

    showPacketInfo(null);
    showTowerInfo(null);
    return;
  }

  if (selectedModuleIndex === null) {
    const tower = findTowerAtPoint(point.x, point.y);

    if (tower) {
      showTowerInfo(tower);
      return;
    }

    const packet = findPacketAtPoint(point.x, point.y);
    showPacketInfo(packet);
    return;
  }

  if (isPointOnPath(point.x, point.y)) {
    const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

    if (selectedModuleInfo) {
      selectedModuleInfo.textContent = 'Нельзя размещать защитный модуль прямо на маршруте движения пакетов.';
    }

    return;
  }

  if (isTooCloseToTower(point.x, point.y)) {
    const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

    if (selectedModuleInfo) {
      selectedModuleInfo.textContent = 'Нельзя размещать защитные модули слишком близко друг к другу.';
    }

    return;
  }

const module = modules[selectedModuleIndex];
const cost = Number(module.cost || 0);

if (resources < cost) {
  const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

  if (selectedModuleInfo) {
    selectedModuleInfo.textContent = 'Недостаточно ресурсов для установки модуля.';
  }

  return;
}

resources -= cost;

const moduleCode = String(module.module_code || module.type || 'basic');
const baseRules = getBaseTowerRules(moduleCode);

towers.push({
  id: towerIdCounter,

  x: point.x,
  y: point.y,

  name: String(module.name || 'Башня'),
  type: String(module.type || 'basic'),
  moduleCode,

  range: Number(module.range || 120),
  damage: Number(module.damage || 1),
  cost,

  osiLevel: Number(module.osi_level || 1),

  analyzes: [...baseRules.analyzes],
  blocks: [...baseRules.blocks],

  level: 1,
  upgradeCost: Math.round(cost * 0.75),
  lastShotTime: 0,
});

  towerIdCounter += 1;
  selectedModuleIndex = null;
  canvas.style.cursor = 'default';

  document.querySelectorAll<HTMLButtonElement>('.tower-select-button').forEach(item => {
    item.classList.remove('selected');
  });

  updateHud();

  const selectedModuleInfo = document.querySelector<HTMLParagraphElement>('#selectedModuleInfo');

  if (selectedModuleInfo) {
    selectedModuleInfo.textContent = 'Модуль размещён. Теперь можно выбрать другой модуль или нажать по пакету.';
  }
});

  updateHud();
  draw();
  animationId = requestAnimationFrame(loop);
}

function renderRunningGame(app: HTMLDivElement, level: Level): void {
  app.innerHTML = `
    <div class="game-shell">
      <div class="game-top-panel">
        <div class="game-logo-block">
          <div class="game-logo-icon">🛡️</div>
          <div>
            <div class="game-title">${level.title}</div>
            <div class="game-subtitle">${level.campaign || 'Кампания'} · ${level.difficulty}</div>
          </div>
        </div>

        <div class="game-stats-bar">
          <div class="game-stat">
            <span>HP</span>
            <b id="baseHealth">${level.base_health}</b>
          </div>
          <div class="game-stat">
            <span>Ресурсы</span>
            <b id="resources">${level.start_resources}</b>
          </div>
          <div class="game-stat">
  <span>Волна</span>
  <b id="waveInfo">1/1</b>
</div>

<div class="game-stat">
  <span>Пакеты</span>
  <b id="wavePackets">0/0</b>
</div>
          <div class="game-stat">
            <span>Угрозы</span>
            <b id="missed">0</b>
          </div>
          <div class="game-stat">
            <span>Блокировки</span>
            <b id="correctBlocks">0</b>
          </div>
          <div class="game-stat">
            <span>Ошибки</span>
            <b id="falsePositives">0</b>
          </div>
          <div class="game-stat">
            <span>Норм. трафик</span>
            <b id="allowedNormalTraffic">0</b>
          </div>
        </div>

        <div class="game-actions">
          <button class="game-control-button" id="pauseButton">Пауза</button>
          <button class="game-control-button" id="speedButton">x1</button>
          <button class="game-control-button danger" id="finishButton">Выход</button>
        </div>
      </div>

      <div class="game-main-area">
  <div class="game-canvas-frame">
    <canvas
      id="gameCanvas"
      width="${level.map_config?.width || 900}"
      height="${level.map_config?.height || 500}"
    ></canvas>
  </div>

  <div class="game-result-side" id="gameResultSide">
    <div class="panel-title">Результат уровня</div>
    <div class="game-info-box">
      Итог появится здесь после завершения уровня.
    </div>
  </div>
</div>

      <div class="game-bottom-panel">
        <div class="tower-shop">
          <div class="panel-title">Защитные модули</div>
          <div class="tower-shop-grid">
            ${(level.defense_config || []).map((module, index) => `
              <button class="tower-card tower-select-button" data-module-index="${index}">
                <div class="tower-card-icon">${getModuleIcon(String(module.type || 'basic'))}</div>
                <div class="tower-card-content">
                  <b>${String(module.name || 'Модуль')}</b>
                  <span>Цена: ${Number(module.cost || 0)}</span>
                  <span>Урон: ${Number(module.damage || 1)} · Радиус: ${Number(module.range || 120)}</span>
                </div>
              </button>
            `).join('')}
          </div>

          <p id="selectedModuleInfo" class="game-message">
            Выберите защитный модуль и установите его рядом с маршрутом.
          </p>
        </div>

        <div class="game-info-panel">
          <div class="panel-title">Информация</div>
          <div id="packetInfo" class="game-info-box">
            Нажмите по пакету, чтобы увидеть IP-адреса, порт, TCP-флаги и пояснение.
          </div>
          <div id="towerInfo" class="game-info-box">
            Нажмите по башне, чтобы посмотреть параметры и улучшить её.
          </div>
        </div>
      </div>

      <div class="game-hint-bar">
  <div id="currentWaveName">
    Подготовка первой волны
  </div>
  <div>
    Обычный трафик нужно пропускать к серверу, вредоносный — блокировать подходящими модулями.
  </div>
</div>
    </div>
  `;
}

function getLevelPaths(level: Level): Array<Array<{ x: number; y: number }>> {
  const mapConfig = level.map_config as unknown as {
    path?: Array<{ x: number; y: number }>;
    paths?: Array<Array<{ x: number; y: number }>>;
  } | null;

  if (mapConfig?.paths && mapConfig.paths.length > 0) {
    return mapConfig.paths;
  }

  if (mapConfig?.path && mapConfig.path.length > 0) {
    return [mapConfig.path];
  }

  return [DEFAULT_PATH];
}

function getThreatSummary(level: Level): string[] {
  const threats = new Set<string>();

  for (const wave of level.waves_config || []) {
    const attack = String(wave.attack || '');

    if (attack) {
      threats.add(attack);
    }
  }

  return Array.from(threats);
}

function getBaseTowerRules(moduleCode: string): {
  analyzes: string[];
  blocks: string[];
} {
  switch (moduleCode) {
    case 'router_acl':
      return {
        analyzes: ['Protocol'],
        blocks: [],
      };

    case 'stateful_firewall':
      return {
        analyzes: ['Protocol', 'Port'],
        blocks: [],
      };

    case 'anti_ddos':
      return {
        analyzes: ['Traffic Rate'],
        blocks: [],
      };

    case 'snort_ips':
      return {
        analyzes: ['Basic Signature'],
        blocks: [],
      };

    case 'dns_filter':
      return {
        analyzes: ['DNS Request'],
        blocks: [],
      };

    case 'waf':
      return {
        analyzes: ['HTTP Request'],
        blocks: [],
      };

    case 'email_gateway':
      return {
        analyzes: ['Email Metadata'],
        blocks: [],
      };

    default:
      return {
        analyzes: [],
        blocks: [],
      };
  }
}

function addTowerRule(
  tower: Tower,
  analyzeRule: string,
  blockRule: string
): void {
  if (!tower.analyzes.includes(analyzeRule)) {
    tower.analyzes.push(analyzeRule);
  }

  if (!tower.blocks.includes(blockRule)) {
    tower.blocks.push(blockRule);
  }
}

function getRecommendedDefenseModules(level: Level): string[] {
  const recommendations = new Set<string>();

  const moduleNames: Record<string, string> = {
    router_acl: 'ACL маршрутизатора',
    stateful_firewall: 'Межсетевой экран',
    anti_ddos: 'Anti-DDoS система',
    snort_ips: 'Snort IPS',
    dns_filter: 'DNS-фильтр',
    waf: 'Web Application Firewall',
    email_gateway: 'Почтовый шлюз безопасности',
  };

  const attackToModules: Record<string, string[]> = {
    icmp_flood: ['router_acl', 'anti_ddos'],
    udp_flood: ['anti_ddos', 'stateful_firewall'],
    syn_flood: ['stateful_firewall', 'anti_ddos'],
    http_flood: ['anti_ddos', 'waf'],

    port_scan: ['stateful_firewall', 'snort_ips'],
    ip_spoofing: ['router_acl', 'stateful_firewall'],
    blocked_ip: ['router_acl'],
    unauthorized_port: ['stateful_firewall'],

    known_exploit: ['snort_ips'],
    malware_traffic: ['snort_ips'],
    botnet: ['snort_ips', 'anti_ddos'],

    malicious_domain: ['dns_filter'],
    dns_tunneling: ['dns_filter', 'snort_ips'],
    c2_domain: ['dns_filter', 'snort_ips'],

    sql_injection: ['waf'],
    xss: ['waf'],
    path_traversal: ['waf'],
    command_injection: ['waf'],

    phishing: ['email_gateway'],
    malware_attachment: ['email_gateway', 'snort_ips'],
    spam: ['email_gateway'],
  };

  function normalize(value: unknown): string {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replaceAll('-', '_')
      .replaceAll(' ', '_');
  }

  for (const wave of level.waves_config || []) {
    const attackType = normalize((wave as any).attack_type);
    const attackName = normalize((wave as any).attack);
    const protocol = normalize((wave as any).protocol);

    const attackKey = attackType || attackName;

    if (attackKey && attackToModules[attackKey]) {
      for (const moduleCode of attackToModules[attackKey]) {
        recommendations.add(moduleNames[moduleCode] || moduleCode);
      }

      continue;
    }

    if (protocol === 'icmp') {
      recommendations.add(moduleNames.router_acl);
      recommendations.add(moduleNames.anti_ddos);
    }

    if (protocol === 'udp') {
      recommendations.add(moduleNames.anti_ddos);
    }

    if (protocol === 'tcp') {
      recommendations.add(moduleNames.stateful_firewall);
    }

    if (protocol === 'dns') {
      recommendations.add(moduleNames.dns_filter);
    }

    if (protocol === 'http') {
      recommendations.add(moduleNames.waf);
    }
  }

  return Array.from(recommendations);
}

function getResultRecommendation(
  isWin: boolean,
  damageTaken: number,
  _destroyed: number,
  missed: number,
  falsePositives: number,
  accuracy: number,
  allowedNormalTraffic: number
): string {
  if (!isWin) {
    return 'База была перегружена: часть вредоносного трафика достигла сервера. Попробуйте раньше размещать защитные модули и использовать защиту по типу атаки.';
  }

  if (falsePositives > 0 && missed > 0) {
    return 'Были и пропущенные угрозы, и ложные срабатывания. Нужно точнее анализировать параметры пакетов: протокол, порт, IP-адрес и тип атаки.';
  }

  if (falsePositives > 0) {
    return 'Есть ложные срабатывания: часть обычного трафика была заблокирована. В реальной сети это может нарушить доступность сервиса.';
  }

  if (missed > 0) {
    return 'Некоторые угрозы дошли до сервера. Попробуйте ставить защитные модули раньше по маршруту и использовать более подходящие фильтры.';
  }

  if (accuracy >= 95 && damageTaken === 0) {
    return 'Отличный результат: угрозы заблокированы, обычный трафик разрешён, база не получила урона.';
  }

  if (allowedNormalTraffic > 0 && allowedNormalTraffic > _destroyed) {
    return 'Вы хорошо сохранили нормальный трафик. Теперь попробуйте повысить эффективность блокировки угроз.';
  }

  if (accuracy >= 85) {
    return 'Хорошая точность классификации. Вы в основном правильно отличаете обычный трафик от вредоносного.';
  }

  return 'Уровень завершён. Для улучшения результата анализируйте параметры пакетов и выбирайте защитные модули под конкретные угрозы.';
}

function generateIpAddress(isSuspicious: boolean): string {
  if (isSuspicious) {
    const suspiciousRanges = ['185.220.101', '45.155.205', '91.240.118', '203.0.113'];
    const range = suspiciousRanges[Math.floor(Math.random() * suspiciousRanges.length)];
    const lastOctet = Math.floor(Math.random() * 254) + 1;

    return `${range}.${lastOctet}`;
  }

  const normalRanges = ['192.168.1', '10.0.0', '172.16.0'];
  const range = normalRanges[Math.floor(Math.random() * normalRanges.length)];
  const lastOctet = Math.floor(Math.random() * 254) + 1;

  return `${range}.${lastOctet}`;
}

function getDestinationIp(): string {
  return '10.0.0.10';
}

function getPacketPort(protocol: string, attack: string | null): number {
  if (attack === 'Port Scan') {
    const scannedPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 5432, 8080];
    return scannedPorts[Math.floor(Math.random() * scannedPorts.length)];
  }

  if (protocol === 'HTTP') {
    return 80;
  }

  if (protocol === 'DNS') {
    return 53;
  }

  if (protocol === 'TCP') {
    return 443;
  }

  if (protocol === 'UDP') {
    return 53;
  }

  return 0;
}

function getTcpFlags(protocol: string, attack: string | null): string | null {
  if (protocol !== 'TCP' && protocol !== 'HTTP') {
    return null;
  }

  if (attack === 'SYN Flood') {
    return 'SYN';
  }

  if (attack === 'Port Scan') {
    return 'SYN, FIN';
  }

  if (attack === 'IP Spoofing') {
    return 'SYN';
  }

  return 'ACK';
}

function getPacketExplanation(protocol: string, attack: string | null, isAttack: boolean): string {
  if (!isAttack) {
    return `Обычный ${protocol}-пакет. Он не содержит признаков атаки и является частью нормального сетевого трафика.`;
  }

  if (attack === 'ICMP Flood') {
    return 'Подозрительный ICMP-пакет. Большое количество таких пакетов может перегрузить сервер.';
  }

  if (attack === 'UDP Flood') {
    return 'Подозрительный UDP-пакет. UDP Flood создаёт большое количество запросов без установки соединения.';
  }

  if (attack === 'SYN Flood') {
    return 'TCP-пакет с SYN-флагом. Массовая отправка таких пакетов может исчерпать ресурсы сервера.';
  }

  if (attack === 'Port Scan') {
    return 'Пакет похож на сканирование портов. Цель — определить открытые сетевые службы.';
  }

  if (attack === 'IP Spoofing') {
    return 'Пакет имеет признаки подмены IP-адреса источника.';
  }

  if (attack === 'DNS Flood') {
    return 'Подозрительный DNS-запрос. Массовые DNS-запросы могут перегрузить сервер.';
  }

  if (attack === 'Malicious Payload') {
    return 'Пакет может содержать вредоносную полезную нагрузку. Для анализа подходит DPI.';
  }

  if (attack?.includes('Botnet')) {
    return 'Пакет является частью распределённой ботнет-атаки.';
  }

  return 'Пакет имеет признаки подозрительной сетевой активности.';
}

function detectPacketTags(
  packet: Packet
): string[] {

  const tags: string[] = [];

  if (packet.attackType === 'ip_spoofing') {
    tags.push('ip_spoofing');
  }

  if (
    packet.sourceIp.startsWith('10.') ||
    packet.sourceIp.startsWith('192.168.')
  ) {
    tags.push('private_ip');
  }

  if (packet.protocol === 'ICMP') {
    tags.push('icmp');
  }

  if (packet.protocol === 'UDP') {
    tags.push('udp');
  }

  if (packet.protocol === 'TCP') {
    tags.push('tcp');
  }

  if (
    packet.tcpFlags === 'SYN' &&
    (packet.packetRate || 0) > 100
  ) {
    tags.push('syn_flood');
  }

  if (packet.attackType === 'udp_flood') {
    tags.push('udp_flood');
  }

  if (packet.attackType === 'icmp_flood') {
    tags.push('icmp_flood');
  }

  if (packet.attackType === 'port_scan') {
    tags.push('port_scan');
  }

  if (packet.isProxy) {
    tags.push('proxy');
  }

  if (packet.isBotnet) {
    tags.push('botnet');
  }

  if (packet.signature) {
    tags.push(
      packet.signature.toLowerCase()
    );
  }

  if (
    packet.payload &&
    packet.payload.length > 0
  ) {
    tags.push('payload');
  }

  if (packet.attackType === 'blocked_ip') {
    tags.push('blocked_ip');
  }

  if (
    packet.destinationPort &&
    ![80, 443, 53, 22].includes(packet.destinationPort)
  ) {
    tags.push('unauthorized_port');
  }

  if (packet.attackType === 'http_flood') {
    tags.push('http_flood');
  }

  if (packet.attackType === 'known_exploit') {
    tags.push('known_exploit');
  }

  if (packet.attackType === 'malware_traffic') {
    tags.push('malware_traffic');
  }

  if (packet.attackType === 'malicious_domain') {
    tags.push('malicious_domain');
  }

  if (packet.attackType === 'dns_tunneling') {
    tags.push('dns_tunneling');
  }

  if (packet.attackType === 'c2_domain') {
    tags.push('c2_domain');
  }

  if (packet.attackType === 'sql_injection') {
    tags.push('sql_injection');
  }

  if (packet.attackType === 'xss') {
    tags.push('xss');
  }

  if (packet.attackType === 'path_traversal') {
    tags.push('path_traversal');
  }

  if (packet.attackType === 'phishing') {
    tags.push('phishing');
  }

  if (packet.attackType === 'malware_attachment') {
    tags.push('malware_attachment');
  }

  if (packet.attackType === 'spam') {
    tags.push('spam');
  }

  return tags;
}

function canTowerAttackPacket(
  tower: Tower,
  packet: Packet
): boolean {

  const packetTags =
    detectPacketTags(packet);

  if (
    tower.blocks.includes('ALL')
  ) {
    return true;
  }

  return tower.blocks.some(
  block =>
    packetTags.includes(
      block.toLowerCase()
    )
);
}
function getModuleIcon(type: string): string {

  if (type === 'router_acl') {
    return '📋';
  }

  if (type === 'stateful_firewall') {
    return '🛡️';
  }

  if (type === 'anti_ddos') {
    return '🌊';
  }

  if (type === 'snort_ips') {
    return '👁️';
  }

  if (type === 'dns_filter') {
    return '🌐';
  }

  if (type === 'waf') {
    return '🔒';
  }

  if (type === 'email_gateway') {
    return '📧';
  }

  return '⚙️';
}

function getTowerColor(
  type: string
): string {

  switch (type) {

    case 'router_acl':
      return '#2563eb'; // синий

    case 'stateful_firewall':
      return '#dc2626'; // красный

    case 'anti_ddos':
      return '#7c3aed'; // фиолетовый

    case 'snort_ips':
      return '#ea580c'; // оранжевый

    case 'dns_filter':
      return '#0891b2'; // голубой

    case 'waf':
      return '#16a34a'; // зелёный

    case 'email_gateway':
      return '#ca8a04'; // золотой

    default:
      return '#6b7280'; // серый
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#020617');
  gradient.addColorStop(0.5, '#07111f');
  gradient.addColorStop(1, '#020617');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(96, 165, 250, 0.06)';

  for (let x = 20; x < canvas.width; x += 120) {
    for (let y = 20; y < canvas.height; y += 120) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPaths(
  ctx: CanvasRenderingContext2D,
  paths: Array<Array<{ x: number; y: number }>>
): void {
  for (const currentPath of paths) {
    drawPath(ctx, currentPath);
  }
}

function drawPath(ctx: CanvasRenderingContext2D, path: Array<{ x: number; y: number }>): void {
  if (path.length < 2) {
    return;
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.lineWidth = 34;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (const point of path.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();

  ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (const point of path.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();

  ctx.setLineDash([14, 16]);
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (const point of path.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
  ctx.setLineDash([]);

  for (const point of path) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.x, point.y, 13, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawBase(
  ctx: CanvasRenderingContext2D,
  base: { x: number; y: number },
  health: number,
  maxHealth: number
): void {
  const x = base.x;
  const y = base.y;

  ctx.save();
  ctx.shadowColor = 'rgba(37, 99, 235, 0.65)';
  ctx.shadowBlur = 22;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  roundRect(ctx, x - 32, y - 42, 64, 84, 10);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1e293b';
  roundRect(ctx, x - 22, y - 30, 44, 12, 4);
  ctx.fill();
  roundRect(ctx, x - 22, y - 10, 44, 12, 4);
  ctx.fill();
  roundRect(ctx, x - 22, y + 10, 44, 12, 4);
  ctx.fill();

  ctx.fillStyle = health > maxHealth * 0.5 ? '#22c55e' : health > maxHealth * 0.2 ? '#f59e0b' : '#ef4444';

  for (const offset of [-24, -4, 16]) {
    ctx.beginPath();
    ctx.arc(x + 17, y + offset, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#e5e7eb';
  ctx.font = 'bold 13px Arial';
  ctx.fillText('SERVER', x - 27, y - 55);

  const hpWidth = 70;
  const hpPercent = Math.max(0, Math.min(1, health / maxHealth));

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  roundRect(ctx, x - hpWidth / 2, y + 52, hpWidth, 9, 4);
  ctx.fill();

  ctx.fillStyle = health > maxHealth * 0.5 ? '#22c55e' : health > maxHealth * 0.2 ? '#f59e0b' : '#ef4444';
  roundRect(ctx, x - hpWidth / 2, y + 52, hpWidth * hpPercent, 9, 4);
  ctx.fill();

  ctx.fillStyle = '#e5e7eb';
  ctx.font = '12px Arial';
  ctx.fillText(`HP ${Math.max(0, health)}`, x - 20, y + 76);
  ctx.restore();
}

function drawTowers(ctx: CanvasRenderingContext2D, towers: Tower[], selectedTowerId: number | null): void {
  for (const tower of towers) {
    const isSelected = tower.id === selectedTowerId;
    const towerColor = getTowerColor(tower.type);

    ctx.save();
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? 'rgba(34, 197, 94, 0.45)' : 'rgba(96, 165, 250, 0.18)';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    ctx.shadowColor = towerColor;
    ctx.shadowBlur = isSelected ? 22 : 14;
    drawTowerModel(ctx, tower.x, tower.y, towerColor, tower.type);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(tower.name, tower.x - 30, tower.y - 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px Arial';
    ctx.fillText(`Lv.${tower.level}`, tower.x - 11, tower.y + 4);
    ctx.restore();
  }
}

function drawTowerModel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  type: string
): void {

  ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;

  switch (type) {

    case 'router_acl':
      drawRouterIcon(ctx, x, y);
      break;

    case 'stateful_firewall':
      drawFirewallIcon(ctx, x, y);
      break;

    case 'anti_ddos':
      drawRateLimiterIcon(ctx, x, y);
      break;

    case 'snort_ips':
      drawEyeIcon(ctx, x, y);
      break;

    case 'dns_filter':
      drawDnsIcon(ctx, x, y);
      break;

    case 'waf':
      drawShieldIcon(ctx, x, y);
      break;

    case 'email_gateway':
      drawMailIcon(ctx, x, y);
      break;

    default:
      drawFilterIcon(ctx, x, y);
  }

  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawRouterIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {

  ctx.fillRect(x - 10, y - 4, 20, 8);

  ctx.fillRect(x - 12, y - 1, 4, 2);
  ctx.fillRect(x + 8, y - 1, 4, 2);

  ctx.fillRect(x - 1, y - 12, 2, 4);
  ctx.fillRect(x - 1, y + 8, 2, 4);
}

function drawEyeIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {

  ctx.beginPath();

  ctx.ellipse(
    x,
    y,
    10,
    6,
    0,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle = ctx.fillStyle;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawDnsIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {

  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x + 9, y);

  ctx.moveTo(x, y - 9);
  ctx.lineTo(x, y + 9);

  ctx.stroke();
}

function drawMailIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {

  ctx.strokeStyle = ctx.fillStyle;

  ctx.strokeRect(
    x - 10,
    y - 7,
    20,
    14
  );

  ctx.beginPath();

  ctx.moveTo(x - 10, y - 7);
  ctx.lineTo(x, y + 1);
  ctx.lineTo(x + 10, y - 7);

  ctx.stroke();
}
function drawFirewallIcon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillRect(x - 10, y - 8, 20, 5);
  ctx.fillRect(x - 10, y - 1, 20, 5);
  ctx.fillRect(x - 10, y + 6, 20, 5);
}

function drawRateLimiterIcon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.arc(x, y, 9, -Math.PI / 2, Math.PI * 1.4);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 7, y - 5);
  ctx.stroke();
}

function drawShieldIcon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y - 11);
  ctx.lineTo(x + 10, y - 6);
  ctx.lineTo(x + 7, y + 9);
  ctx.lineTo(x, y + 13);
  ctx.lineTo(x - 7, y + 9);
  ctx.lineTo(x - 10, y - 6);
  ctx.closePath();
  ctx.fill();
}

function drawFilterIcon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 9);
  ctx.lineTo(x + 11, y - 9);
  ctx.lineTo(x + 3, y + 1);
  ctx.lineTo(x + 3, y + 10);
  ctx.lineTo(x - 3, y + 10);
  ctx.lineTo(x - 3, y + 1);
  ctx.closePath();
  ctx.fill();
}

function drawPackets(ctx: CanvasRenderingContext2D, packets: Packet[]): void {
  for (const packet of packets) {
    if (packet.reachedBase || packet.destroyed) {
      continue;
    }

    const color = getPacketColor(packet);

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = packet.isMalicious ? 16 : 10;

    if (packet.isMalicious) {
      drawAttackPacket(ctx, packet.x, packet.y, color);
    } else {
      drawNormalPacket(ctx, packet.x, packet.y, color);
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(packet.protocol, packet.x - 13, packet.y - 20);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px Arial';
    ctx.fillText(`${packet.health}/${packet.maxHealth}`, packet.x - 8, packet.y + 4);

    if (packet.destinationPort !== 0) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px Arial';
      ctx.fillText(`:${packet.destinationPort}`, packet.x - 10, packet.y + 15);
    }

    ctx.restore();
  }
}

function getPacketColor(packet: Packet): string {
  if (packet.isMalicious) {
    return '#ef4444';
  }

  if (packet.protocol === 'TCP') {
    return '#22c55e';
  }

  if (packet.protocol === 'UDP') {
    return '#eab308';
  }

  if (packet.protocol === 'ICMP') {
    return '#a855f7';
  }

  if (packet.protocol === 'HTTP') {
    return '#38bdf8';
  }

  if (packet.protocol === 'DNS') {
    return '#06b6d4';
  }

  return '#38bdf8';
}

function drawNormalPacket(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  roundRect(ctx, x - 15, y - 10, 30, 20, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillRect(x - 9, y - 4, 18, 2);
  ctx.fillRect(x - 9, y + 2, 13, 2);

  ctx.beginPath();
  ctx.arc(x + 11, y - 6, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawAttackPacket(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = 'rgba(127, 29, 29, 0.95)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, y - 15);
  ctx.lineTo(x + 15, y + 11);
  ctx.lineTo(x - 15, y + 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fecaca';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('!', x - 4, y + 6);
}

function drawShotEffects(ctx: CanvasRenderingContext2D, effects: ShotEffect[]): void {
  for (const effect of effects) {
    const gradient = ctx.createLinearGradient(effect.fromX, effect.fromY, effect.toX, effect.toY);
    gradient.addColorStop(0, '#bfdbfe');
    gradient.addColorStop(0.5, '#38bdf8');
    gradient.addColorStop(1, '#22c55e');

    ctx.beginPath();
    ctx.moveTo(effect.fromX, effect.fromY);
    ctx.lineTo(effect.toX, effect.toY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(effect.toX, effect.toY, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(effect.toX, effect.toY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.fill();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  for (const item of texts) {
    ctx.save();
    ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = item.text.startsWith('-') ? '#fecaca' : '#bbf7d0';
    ctx.font = 'bold 17px Arial';
    ctx.fillText(item.text, item.x - 12, item.y);
    ctx.restore();
  }
}

function drawPauseOverlay(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e5e7eb';
  ctx.font = '36px Arial';
  ctx.fillText('Пауза', canvas.width / 2 - 55, canvas.height / 2);

  ctx.font = '16px Arial';
  ctx.fillText('Нажмите “Продолжить”, чтобы вернуться к уровню', canvas.width / 2 - 170, canvas.height / 2 + 34);
}



function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  selectedModuleIndex: number | null,
  modules: Array<Record<string, unknown>>,
  x: number,
  y: number,
  isVisible: boolean,
  isOnPath: boolean,
  isTooClose: boolean
): void {
  if (selectedModuleIndex === null || !isVisible) {
    return;
  }

  const module = modules[selectedModuleIndex];

  if (!module) {
    return;
  }

  const range = Number(module.range || 120);
  const type = String(module.type || 'basic');
  const canPlace = !isOnPath && !isTooClose;

  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, range, 0, Math.PI * 2);
  ctx.fillStyle = canPlace
    ? 'rgba(34, 197, 94, 0.08)'
    : 'rgba(239, 68, 68, 0.08)';
  ctx.fill();

  ctx.strokeStyle = canPlace
    ? 'rgba(34, 197, 94, 0.45)'
    : 'rgba(239, 68, 68, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fillStyle = canPlace
    ? 'rgba(34, 197, 94, 0.75)'
    : 'rgba(239, 68, 68, 0.75)';
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getModuleIcon(type), x, y + 1);

  ctx.font = '12px Arial';
  ctx.textBaseline = 'alphabetic';

  if (canPlace) {
    ctx.fillStyle = '#bbf7d0';
    ctx.fillText('Можно установить', x, y - range - 10);
  } else {
    ctx.fillStyle = '#fecaca';

    if (isOnPath) {
      ctx.fillText('Нельзя ставить на маршруте', x, y - range - 10);
    } else {
      ctx.fillText('Слишком близко к башне', x, y - range - 10);
    }
  }

  ctx.restore();
}

function getModuleDescription(
  code: string
): string {

  switch (code) {

    case 'router_acl':
      return 'Фильтрация по IP-адресам, ICMP и сетевым протоколам.';

    case 'stateful_firewall':
      return 'Контроль TCP/UDP-соединений, анализ портов и состояния сеанса.';

    case 'anti_ddos':
      return 'Обнаружение аномальной интенсивности трафика и блокировка flood-атак.';

    case 'snort_ips':
      return 'Обнаружение и предотвращение известных атак по сигнатурам.';

    case 'dns_filter':
      return 'Фильтрация DNS-запросов и блокировка вредоносных доменов.';

    case 'waf':
      return 'Защита веб-приложений от SQL Injection, XSS и Path Traversal.';

    case 'email_gateway':
      return 'Проверка электронной почты на фишинг, спам и вредоносные вложения.';

    default:
      return 'Модуль сетевой безопасности.';
  }
}