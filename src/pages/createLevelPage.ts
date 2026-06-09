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

function createDefenseConfig(
  scenario: string
): Array<Record<string, unknown>> {

  if (scenario === 'icmp') {

    return [
      {
        name: 'Router ACL',
        type: 'router_acl',
        moduleCode: 'router_acl',

        cost: 50,
        range: 120,
        damage: 1,

        description:
          'Фильтрация пакетов по IP-адресам и ICMP.',

        analyzes: [
          'protocol',
          'src_ip',
          'dst_ip',
          'icmp_type'
        ],

        blocks: [
          'ICMP',
          'PRIVATE_IP'
        ]
      },

      {
        name: 'Anti-DDoS',
        type: 'anti_ddos',
        moduleCode: 'anti_ddos',

        cost: 90,
        range: 150,
        damage: 2,

        description:
          'Обнаружение ICMP Flood.',

        analyzes: [
          'packet_rate',
          'connection_rate'
        ],

        blocks: [
          'ICMP_FLOOD'
        ]
      }
    ];
  }

  if (scenario === 'udp') {

    return [
      {
        name: 'Router ACL',
        type: 'router_acl',
        moduleCode: 'router_acl',

        cost: 50,
        range: 120,
        damage: 1,

        description:
          'Фильтрация UDP-пакетов.',

        analyzes: [
          'protocol',
          'src_ip',
          'dst_ip'
        ],

        blocks: [
          'UDP'
        ]
      },

      {
        name: 'Anti-DDoS',
        type: 'anti_ddos',
        moduleCode: 'anti_ddos',

        cost: 90,
        range: 150,
        damage: 2,

        description:
          'Обнаружение UDP Flood.',

        analyzes: [
          'packet_rate'
        ],

        blocks: [
          'UDP_FLOOD'
        ]
      },

      {
        name: 'Snort IPS',
        type: 'snort_ips',
        moduleCode: 'snort_ips',

        cost: 120,
        range: 170,
        damage: 3,

        description:
          'Анализ сетевых сигнатур.',

        analyzes: [
          'signature',
          'payload'
        ],

        blocks: [
          'BOTNET'
        ]
      }
    ];
  }

  if (scenario === 'tcp') {

    return [
      {
        name: 'Stateful Firewall',
        type: 'stateful_firewall',
        moduleCode: 'stateful_firewall',

        cost: 70,
        range: 140,
        damage: 2,

        description:
          'Контроль TCP-соединений.',

        analyzes: [
          'protocol',
          'src_port',
          'dst_port'
        ],

        blocks: [
          'TCP'
        ]
      },

      {
        name: 'Anti-DDoS',
        type: 'anti_ddos',
        moduleCode: 'anti_ddos',

        cost: 90,
        range: 160,
        damage: 3,

        description:
          'Защита от SYN Flood.',

        analyzes: [
          'packet_rate',
          'tcp_flags'
        ],

        blocks: [
          'SYN_FLOOD'
        ]
      },

      {
        name: 'Snort IPS',
        type: 'snort_ips',
        moduleCode: 'snort_ips',

        cost: 120,
        range: 170,
        damage: 3,

        description:
          'Обнаружение сканирования портов.',

        analyzes: [
          'signature'
        ],

        blocks: [
          'PORT_SCAN'
        ]
      }
    ];
  }

  return [

    {
      name: 'Router ACL',
      type: 'router_acl',
      moduleCode: 'router_acl',

      cost: 50,
      range: 120,
      damage: 1,

      description:
        'Фильтрация IP и протоколов.',

      analyzes: [
        'protocol',
        'src_ip',
        'dst_ip'
      ],

      blocks: [
        'TCP',
        'UDP',
        'ICMP'
      ]
    },

    {
      name: 'Stateful Firewall',
      type: 'stateful_firewall',
      moduleCode: 'stateful_firewall',

      cost: 80,
      range: 140,
      damage: 2,

      description:
        'Контроль состояния соединений.',

      analyzes: [
        'tcp_flags',
        'src_port',
        'dst_port'
      ],

      blocks: [
        'SYN_FLOOD'
      ]
    },

    {
      name: 'Anti-DDoS',
      type: 'anti_ddos',
      moduleCode: 'anti_ddos',

      cost: 100,
      range: 160,
      damage: 2,

      description:
        'Защита от flood-атак.',

      analyzes: [
        'packet_rate'
      ],

      blocks: [
        'UDP_FLOOD',
        'ICMP_FLOOD'
      ]
    },

    {
      name: 'Snort IPS',
      type: 'snort_ips',
      moduleCode: 'snort_ips',

      cost: 130,
      range: 170,
      damage: 3,

      description:
        'Сигнатурное обнаружение атак.',

      analyzes: [
        'signature',
        'payload'
      ],

      blocks: [
        'PORT_SCAN',
        'BOTNET'
      ]
    }
  ];
}