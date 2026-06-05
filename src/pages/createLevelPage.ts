import { createLevel, getTopics } from '../api/client';
import { navigate } from '../main';
import type { LevelCreate } from '../types';

export async function renderCreateLevelPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Создание уровня</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
    const topics = await getTopics();

    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Создание нового уровня</h1>
          <p>Форма создаёт уровень с готовой базовой игровой конфигурацией.</p>

          <button class="button secondary" id="backButton">Назад в админ-панель</button>
        </div>

        <div class="card">
          <label>Название уровня</label>
          <input class="input" id="title" placeholder="Например: UDP-флуд" />

          <label>Описание</label>
          <input class="input" id="description" placeholder="Краткое описание уровня" />

          <label>Учебная тема</label>
          <select class="input" id="topicSelect">
            <option value="">Без темы</option>
            ${topics.map(topic => `
              <option value="${topic.id}" data-title="${topic.title}">
                ${topic.title}
              </option>
            `).join('')}
          </select>

          <label>Сложность</label>
          <select class="input" id="difficulty">
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>

          <label>Здоровье базы</label>
          <input class="input" id="baseHealth" type="number" value="100" />

          <label>Начальные ресурсы</label>
          <input class="input" id="startResources" type="number" value="150" />

          <label>Тип сценария</label>
          <select class="input" id="scenario">
            <option value="icmp">ICMP-флуд</option>
            <option value="udp">UDP-флуд</option>
            <option value="tcp">SYN-флуд</option>
            <option value="mixed">Комбинированная атака</option>
          </select>

          <button class="button" id="createButton">Создать уровень</button>

          <div id="message"></div>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('admin');
    });

    document.querySelector<HTMLButtonElement>('#createButton')!.addEventListener('click', async () => {
      const title = document.querySelector<HTMLInputElement>('#title')!.value;
      const description = document.querySelector<HTMLInputElement>('#description')!.value;
      const topicSelect = document.querySelector<HTMLSelectElement>('#topicSelect')!;
      const difficulty = document.querySelector<HTMLSelectElement>('#difficulty')!.value;
      const baseHealth = Number(document.querySelector<HTMLInputElement>('#baseHealth')!.value);
      const startResources = Number(document.querySelector<HTMLInputElement>('#startResources')!.value);
      const scenario = document.querySelector<HTMLSelectElement>('#scenario')!.value;
      const message = document.querySelector<HTMLDivElement>('#message')!;

      if (!title.trim()) {
        message.innerHTML = `<p class="error">Введите название уровня.</p>`;
        return;
      }

      const selectedOption = topicSelect.options[topicSelect.selectedIndex];
      const topicId = topicSelect.value ? Number(topicSelect.value) : null;
      const topicTitle = topicId ? selectedOption.textContent?.trim() || null : null;

      const levelData: LevelCreate = {
        title,
        description: description || null,
        topic: topicTitle,
        topic_id: topicId,
        difficulty,
        base_health: baseHealth,
        start_resources: startResources,
        map_config: createDefaultMap(),
        waves_config: createWavesConfig(scenario),
        defense_config: createDefenseConfig(scenario),
        campaign: 'Пользовательская кампания',
        order_number: 99,
      };

      try {
        const createdLevel = await createLevel(levelData);

        message.innerHTML = `
          <p class="success">
            Уровень создан. ID: ${createdLevel.id}
          </p>
        `;
      } catch (error) {
        message.innerHTML = `<p class="error">${(error as Error).message}</p>`;
      }
    });
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка</h1>
          <p class="error">${(error as Error).message}</p>
          <button class="button" id="backButton">Назад</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('admin');
    });
  }
}

function createDefaultMap() {
  return {
    path: [
      { x: 0, y: 220 },
      { x: 180, y: 220 },
      { x: 360, y: 140 },
      { x: 580, y: 140 },
      { x: 780, y: 260 },
      { x: 860, y: 260 },
    ],
    base: { x: 860, y: 260 },
    width: 900,
    height: 500,
  };
}

function createWavesConfig(scenario: string): Array<Record<string, unknown>> {
  if (scenario === 'icmp') {
    return [
      {
        wave: 1,
        packet_type: 'normal',
        protocol: 'ICMP',
        count: 10,
        speed: 1.2,
        spawn_delay: 0.8,
        damage: 4,
      },
      {
        wave: 2,
        packet_type: 'attack',
        protocol: 'ICMP',
        attack: 'ICMP Flood',
        count: 25,
        speed: 1.8,
        spawn_delay: 0.35,
        damage: 7,
      },
    ];
  }

  if (scenario === 'udp') {
    return [
      {
        wave: 1,
        packet_type: 'normal',
        protocol: 'UDP',
        count: 12,
        speed: 1.3,
        spawn_delay: 0.8,
        damage: 5,
      },
      {
        wave: 2,
        packet_type: 'attack',
        protocol: 'UDP',
        attack: 'UDP Flood',
        count: 28,
        speed: 1.8,
        spawn_delay: 0.35,
        damage: 8,
      },
    ];
  }

  if (scenario === 'tcp') {
    return [
      {
        wave: 1,
        packet_type: 'normal',
        protocol: 'TCP',
        count: 12,
        speed: 1.2,
        spawn_delay: 0.8,
        damage: 5,
      },
      {
        wave: 2,
        packet_type: 'attack',
        protocol: 'TCP',
        attack: 'SYN Flood',
        count: 30,
        speed: 1.7,
        spawn_delay: 0.4,
        damage: 8,
      },
    ];
  }

  return [
    {
      wave: 1,
      packet_type: 'normal',
      protocol: 'TCP',
      count: 10,
      speed: 1.2,
      spawn_delay: 0.8,
      damage: 5,
    },
    {
      wave: 2,
      packet_type: 'attack',
      protocol: 'ICMP',
      attack: 'ICMP Flood',
      count: 18,
      speed: 1.7,
      spawn_delay: 0.4,
      damage: 6,
    },
    {
      wave: 3,
      packet_type: 'attack',
      protocol: 'UDP',
      attack: 'UDP Flood',
      count: 18,
      speed: 1.8,
      spawn_delay: 0.4,
      damage: 7,
    },
    {
      wave: 4,
      packet_type: 'attack',
      protocol: 'TCP',
      attack: 'SYN Flood',
      count: 18,
      speed: 1.7,
      spawn_delay: 0.4,
      damage: 8,
    },
  ];
}

function createDefenseConfig(scenario: string): Array<Record<string, unknown>> {
  const basic = [
    {
      name: 'Базовый фильтр',
      type: 'protocol_filter',
      cost: 30,
      range: 120,
      damage: 1,
      description: 'Фильтрует пакеты по выбранному протоколу.',
    },
  ];

  if (scenario === 'icmp') {
    return [
      ...basic,
      {
        name: 'ICMP-фильтр',
        type: 'icmp_filter',
        cost: 40,
        range: 130,
        damage: 2,
        description: 'Блокирует подозрительные ICMP-пакеты.',
      },
      {
        name: 'Rate Limiter',
        type: 'rate_limiter',
        cost: 60,
        range: 150,
        damage: 2,
        description: 'Ограничивает частоту однотипных запросов.',
      },
    ];
  }

  if (scenario === 'udp') {
    return [
      ...basic,
      {
        name: 'UDP-фильтр',
        type: 'udp_filter',
        cost: 50,
        range: 130,
        damage: 2,
        description: 'Блокирует подозрительные UDP-пакеты.',
      },
      {
        name: 'Rate Limiter',
        type: 'rate_limiter',
        cost: 60,
        range: 150,
        damage: 2,
        description: 'Ограничивает частоту UDP-запросов.',
      },
    ];
  }

  if (scenario === 'tcp') {
    return [
      ...basic,
      {
        name: 'Firewall',
        type: 'firewall',
        cost: 70,
        range: 140,
        damage: 2,
        description: 'Блокирует подозрительные TCP-пакеты.',
      },
      {
        name: 'SYN-защита',
        type: 'syn_protection',
        cost: 80,
        range: 160,
        damage: 3,
        description: 'Эффективна против SYN-флуда.',
      },
    ];
  }

  return [
    ...basic,
    {
      name: 'Firewall',
      type: 'firewall',
      cost: 70,
      range: 140,
      damage: 2,
      description: 'Универсальная фильтрация подозрительного трафика.',
    },
    {
      name: 'Rate Limiter',
      type: 'rate_limiter',
      cost: 60,
      range: 150,
      damage: 2,
      description: 'Эффективен против flood-атак.',
    },
    {
      name: 'SYN-защита',
      type: 'syn_protection',
      cost: 80,
      range: 160,
      damage: 3,
      description: 'Эффективна против SYN-флуда.',
    },
  ];
}