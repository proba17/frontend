import { getTopics } from '../api/client';
import { navigate } from '../main';

type Topic = {
  id: number;
  title: string;
  short_description?: string | null;
  content?: string | null;
  category?: string | null;
};

type TopicSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

type TopicMaterial = {
  sections: TopicSection[];
  gameCards: string;
};

export async function renderTopicsPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Обучающие материалы</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
    const topics = await getTopics();
    renderTopicsList(app, topics);
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

    document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
      navigate('levels');
    });
  }
}

function renderTopicsList(app: HTMLDivElement, topics: Topic[]): void {
  const categories = ['Основы сетей', 'Протоколы', 'Атаки', 'Защита'];

  const groupedTopics = categories
    .map(category => {
      return {
        category,
        topics: topics.filter(topic => topic.category === category),
      };
    })
    .filter(group => group.topics.length > 0);

  const topicsWithoutCategory = topics.filter(topic => !topic.category);

  if (topicsWithoutCategory.length > 0) {
    groupedTopics.push({
      category: 'Без категории',
      topics: topicsWithoutCategory,
    });
  }

  const topicsHtml = groupedTopics
    .map(group => {
      const itemsHtml = group.topics
        .map(topic => {
          return `
            <button class="mini-card topic-card-button" data-topic-id="${topic.id}">
              <div class="badge">${topic.category || 'Тема'}</div>
              <h3>${topic.title}</h3>
              <p><b>${topic.short_description || 'Нажмите, чтобы открыть подробное описание темы.'}</b></p>
              <p class="topic-card-hint">Открыть тему →</p>
            </button>
          `;
        })
        .join('');

      return `
        <div class="card">
          <div class="page-title-row">
            <div>
              <h2>${group.category}</h2>
              <p>${getTopicCategoryDescription(group.category)}</p>
            </div>

            <span class="badge">${group.topics.length} тем</span>
          </div>

          <div class="grid">
            ${itemsHtml}
          </div>
        </div>
      `;
    })
    .join('');

  app.innerHTML = `
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-logo"></div>
          <div>
            <div class="brand-title">Обучающие материалы</div>
            <div class="brand-subtitle">Протоколы, атаки и защитные механизмы</div>
          </div>
        </div>

        <div class="nav-actions">
          <button class="button" id="testsButton">Тесты</button>
          <button class="button secondary" id="backButton">Назад к уровням</button>
        </div>
      </div>

      <div class="card hero">
        <div>
          <div class="hero-kicker">📘 Теория перед практикой</div>
          <h1 class="glow-text">Раздел обучения</h1>
          <p>
            Здесь собраны подробные учебные материалы по сетевым протоколам,
            типовым атакам и защитным механизмам. Эти темы напрямую связаны
            с игровыми уровнями: пользователь изучает теорию, затем применяет её
            при анализе пакетов и выборе защитных модулей.
          </p>
        </div>

        <div class="hero-panel">
          <div class="hero-line"></div>
          <div class="hero-node"></div>
          <div class="hero-node"></div>
          <div class="hero-node"></div>
        </div>
      </div>

      ${topicsHtml}
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#testsButton')?.addEventListener('click', () => {
    navigate('tests');
  });

  document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
    navigate('levels');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-topic-id]').forEach(button => {
    button.addEventListener('click', () => {
      const topicId = Number(button.dataset.topicId);
      const topic = topics.find(item => item.id === topicId);

      if (topic) {
        window.scrollTo(0, 0);
        renderTopicDetails(app, topics, topic);
      }
    });
  });
}

function renderTopicDetails(app: HTMLDivElement, topics: Topic[], topic: Topic): void {
  const material = getTopicMaterial(topic.title);

  app.innerHTML = `
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-logo"></div>
          <div>
            <div class="brand-title">Обучение</div>
            <div class="brand-subtitle">${topic.title}</div>
          </div>
        </div>

        <div class="nav-actions">
          <button class="button" id="testsButton">Тесты</button>
          <button class="button secondary" id="backToTopicsButton">Назад к темам</button>
          <button class="button secondary" id="backButton">Назад к уровням</button>
        </div>
      </div>

      <div class="card hero">
        <div>
          <div class="hero-kicker">📘 Учебная тема</div>
          <h1 class="glow-text">${topic.title}</h1>
          <p>
            ${topic.short_description || 'Подробный учебный материал по теме и её применению в игре.'}
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
        <h2>Подробное описание</h2>
        <div class="topic-content detailed-topic-content">
          ${getDetailedTopicContent(topic, material)}
        </div>
      </div>

      <div class="card">
        <h2>Как это связано с игрой</h2>
        <div class="grid">
          ${material.gameCards}
        </div>
      </div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#testsButton')?.addEventListener('click', () => {
    navigate('tests');
  });

  document.querySelector<HTMLButtonElement>('#backToTopicsButton')?.addEventListener('click', () => {
    window.scrollTo(0, 0);
    renderTopicsList(app, topics);
  });

  document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
    navigate('levels');
  });
}

function getTopicCategoryDescription(category: string): string {
  if (category === 'Основы сетей') {
    return 'Базовые понятия передачи данных, сетевых пакетов, адресации и маршрутизации.';
  }

  if (category === 'Протоколы') {
    return 'Описание сетевых протоколов, портов, флагов и особенностей передачи данных.';
  }

  if (category === 'Атаки') {
    return 'Типовые сетевые угрозы, которые моделируются в игровых уровнях.';
  }

  if (category === 'Защита') {
    return 'Защитные механизмы и модули, применяемые против сетевых атак.';
  }

  return 'Дополнительные учебные материалы.';
}

function getDetailedTopicContent(topic: Topic, material: TopicMaterial): string {
  const baseContent = topic.content
    ? `
      <section class="topic-section">
        <h3>Краткое описание из учебного материала</h3>
        ${formatTopicText(topic.content)}
      </section>
    `
    : '';

  const generatedSections = material.sections
    .map(section => {
      const paragraphsHtml = section.paragraphs
        ? section.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')
        : '';

      const listHtml = section.list
        ? `
          <ul>
            ${section.list.map(item => `<li>${item}</li>`).join('')}
          </ul>
        `
        : '';

      return `
        <section class="topic-section">
          <h3>${section.title}</h3>
          ${paragraphsHtml}
          ${listHtml}
        </section>
      `;
    })
    .join('');

  return `${baseContent}${generatedSections}`;
}

function formatTopicText(content: string): string {
  return content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => `<p>${line}</p>`)
    .join('');
}

function getTopicMaterial(title: string): TopicMaterial {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('tcp')) {
    return createMaterial(
      [
        {
          title: '1. Что такое TCP',
          paragraphs: [
            'TCP — это протокол транспортного уровня, который обеспечивает надёжную передачу данных между клиентом и сервером. Его используют там, где важно, чтобы данные дошли полностью, в правильном порядке и без потерь.',
            'В отличие от UDP, TCP сначала устанавливает соединение. Только после этого начинается передача данных. Такой подход делает TCP более надёжным, но немного более тяжёлым по сравнению с UDP.',
            'TCP используется в веб-приложениях, API, подключениях к базам данных, передаче файлов, почтовых сервисах, удалённом администрировании и множестве других сетевых сценариев.',
          ],
        },
        {
          title: '2. Как работает TCP-соединение',
          paragraphs: [
            'Перед передачей данных TCP выполняет процедуру установления соединения. Её часто называют трёхсторонним рукопожатием.',
            'Сначала клиент отправляет SYN-пакет. Сервер отвечает SYN-ACK. Затем клиент отправляет ACK. После этого соединение считается установленным.',
            'Такая схема позволяет убедиться, что обе стороны готовы к обмену данными. Но именно этот механизм может стать целью атаки SYN Flood.',
          ],
          list: [
            '<b>SYN</b> — запрос на установление соединения.',
            '<b>SYN-ACK</b> — ответ сервера и подтверждение готовности.',
            '<b>ACK</b> — финальное подтверждение клиента.',
            '<b>FIN</b> — корректное завершение соединения.',
            '<b>RST</b> — аварийный сброс соединения.',
          ],
        },
        {
          title: '3. Какие признаки TCP-пакета нужно анализировать',
          paragraphs: [
            'TCP-пакет нельзя оценивать только по названию протокола. TCP может быть как нормальным пользовательским трафиком, так и частью атаки.',
          ],
          list: [
            '<b>Порт назначения</b>: 80, 443, 22, 5432 и другие порты помогают понять, к какому сервису идёт обращение.',
            '<b>TCP-флаги</b>: SYN, ACK, FIN, RST помогают понять состояние соединения.',
            '<b>IP-адрес источника</b>: подозрительный источник может повышать риск.',
            '<b>Частота пакетов</b>: большое количество однотипных TCP-пакетов может быть признаком атаки.',
            '<b>Тип атаки</b>: если пакет относится к SYN Flood или Port Scan, его нужно обрабатывать как угрозу.',
          ],
        },
        {
          title: '4. TCP в игре',
          paragraphs: [
            'В игре TCP-пакеты могут быть обычным трафиком, который нужно пропустить к серверу. Если игрок блокирует нормальный TCP-пакет, это считается ложным срабатыванием.',
            'Но TCP также используется в атаках. Например, SYN Flood основан на большом количестве TCP-пакетов с SYN-флагом. Port Scan тоже может использовать TCP-запросы к разным портам.',
            'Главная задача игрока — не уничтожать все TCP-пакеты подряд, а анализировать признаки пакета и выбирать правильный модуль защиты.',
          ],
        },
        {
          title: '5. Какие защитные модули подходят',
          list: [
            '<b>Firewall</b> — базовая фильтрация TCP/HTTP-трафика.',
            '<b>SYN-защита</b> — лучший вариант против SYN Flood.',
            '<b>IDS</b> — полезен при подозрительном поведении, например Port Scan.',
            '<b>ACL</b> — помогает фильтровать соединения по IP-адресам и правилам доступа.',
          ],
        },
        {
          title: '6. Типичные ошибки игрока',
          list: [
            'Блокировать все TCP-пакеты подряд.',
            'Не смотреть на TCP-флаги.',
            'Использовать обычный Firewall против SYN Flood, когда лучше подходит SYN-защита.',
            'Размещать модуль слишком поздно по маршруту.',
            'Игнорировать порт и IP-адрес источника.',
          ],
        },
        {
          title: '7. Пример анализа пакета',
          paragraphs: [
            'Если пакет имеет протокол TCP, порт 443 и флаг ACK, он может быть нормальным HTTPS-трафиком. Такой пакет не нужно блокировать без дополнительных признаков атаки.',
            'Если пакет имеет протокол TCP, флаг SYN и тип атаки SYN Flood, его нужно заблокировать до достижения сервера. Для этого лучше использовать SYN-защиту.',
          ],
        },
        {
          title: '8. Главное, что нужно запомнить',
          paragraphs: [
            'TCP — надёжный протокол с установкой соединения. Он нужен для нормальной работы многих сервисов, но может использоваться в атаках. Поэтому важно анализировать флаги, порт, источник и тип трафика.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>TCP может быть обычным трафиком или частью атаки SYN Flood / Port Scan.</p>
        </div>
        <div class="mini-card">
          <h3>Что смотреть</h3>
          <p>Порт, TCP-флаги, IP-адрес источника, тип атаки и пояснение пакета.</p>
        </div>
        <div class="mini-card">
          <h3>Подходящая защита</h3>
          <p>
            <span class="badge recommended">Firewall</span>
            <span class="badge recommended">SYN-защита</span>
            <span class="badge recommended">IDS</span>
          </p>
        </div>
        <div class="mini-card">
          <h3>Ошибка</h3>
          <p>Нельзя блокировать все TCP-пакеты подряд: часть из них является нормальным трафиком.</p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('udp')) {
    return createMaterial(
      [
        {
          title: '1. Что такое UDP',
          paragraphs: [
            'UDP — это протокол транспортного уровня, который передаёт данные без предварительного установления соединения.',
            'Он работает быстрее TCP, потому что не выполняет трёхстороннее рукопожатие, не подтверждает доставку каждого пакета и не восстанавливает порядок данных.',
            'UDP часто используется там, где важна скорость: онлайн-игры, видеозвонки, потоковое видео, голосовая связь и DNS-запросы.',
          ],
        },
        {
          title: '2. Чем UDP отличается от TCP',
          list: [
            'UDP не устанавливает соединение перед передачей данных.',
            'UDP не гарантирует доставку пакетов.',
            'UDP не гарантирует порядок получения пакетов.',
            'UDP быстрее и проще TCP.',
            'UDP чаще используется там, где потеря отдельных пакетов допустима.',
          ],
        },
        {
          title: '3. Почему UDP может быть опасен',
          paragraphs: [
            'Так как UDP не требует установки соединения, злоумышленнику проще отправлять большое количество UDP-пакетов на сервер.',
            'При UDP Flood сервер получает интенсивный поток UDP-пакетов, тратит ресурсы на обработку и может начать хуже обслуживать нормальных пользователей.',
          ],
        },
        {
          title: '4. Какие признаки UDP-пакета анализировать',
          list: [
            '<b>Протокол</b>: UDP.',
            '<b>Порт</b>: например 53 для DNS.',
            '<b>Частота появления</b>: слишком много пакетов может означать flood-атаку.',
            '<b>Тип атаки</b>: UDP Flood или обычный трафик.',
            '<b>Пояснение пакета</b>: помогает понять, является ли пакет угрозой.',
          ],
        },
        {
          title: '5. UDP в игре',
          paragraphs: [
            'В игре UDP может быть обычным трафиком. Такой пакет нужно пропустить к серверу.',
            'Если уровень моделирует UDP Flood, UDP-пакеты становятся угрозой. Их нужно блокировать подходящими модулями.',
            'Игрок должен отличать нормальный UDP-трафик от массовой атаки.',
          ],
        },
        {
          title: '6. Подходящие модули защиты',
          list: [
            '<b>UDP-фильтр</b> — специализированная защита для UDP-трафика.',
            '<b>Rate Limiter</b> — ограничивает слишком интенсивный поток пакетов.',
            '<b>IDS</b> — помогает обнаруживать подозрительное поведение.',
          ],
        },
        {
          title: '7. Типичные ошибки игрока',
          list: [
            'Считать весь UDP-трафик вредоносным.',
            'Не учитывать частоту появления пакетов.',
            'Не использовать Rate Limiter против flood-атаки.',
            'Блокировать нормальные DNS-запросы, которые идут через UDP.',
          ],
        },
        {
          title: '8. Главное, что нужно запомнить',
          paragraphs: [
            'UDP — быстрый протокол без установки соединения. Он полезен для нормальных сервисов, но может применяться в flood-атаках. В игре важно смотреть не только на протокол, но и на тип пакета и интенсивность потока.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>UDP может быть нормальным трафиком или частью UDP Flood.</p>
        </div>
        <div class="mini-card">
          <h3>Что смотреть</h3>
          <p>Порт, интенсивность потока, тип атаки и пояснение пакета.</p>
        </div>
        <div class="mini-card">
          <h3>Подходящая защита</h3>
          <p>
            <span class="badge recommended">UDP-фильтр</span>
            <span class="badge recommended">Rate Limiter</span>
          </p>
        </div>
        <div class="mini-card">
          <h3>Ошибка</h3>
          <p>Не весь UDP является атакой. Нормальный UDP-трафик нужно пропускать.</p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('icmp')) {
    return createMaterial(
      [
        {
          title: '1. Что такое ICMP',
          paragraphs: [
            'ICMP — это служебный сетевой протокол, который используется для диагностики сети и передачи сообщений об ошибках.',
            'Самый известный пример ICMP — команда ping. Она позволяет проверить, доступен ли узел в сети и сколько времени занимает ответ.',
          ],
        },
        {
          title: '2. Для чего используется ICMP',
          list: [
            'Проверка доступности узла.',
            'Диагностика сетевых проблем.',
            'Передача сообщений об ошибках маршрутизации.',
            'Оценка задержки между устройствами.',
          ],
        },
        {
          title: '3. Когда ICMP становится угрозой',
          paragraphs: [
            'Один ICMP-пакет обычно не опасен. Но большое количество ICMP-запросов может стать ICMP Flood-атакой.',
            'При ICMP Flood сервер получает слишком много служебных запросов и тратит ресурсы на ответы.',
          ],
        },
        {
          title: '4. ICMP в игре',
          paragraphs: [
            'В игре ICMP может быть нормальным диагностическим трафиком или вредоносной атакой ICMP Flood.',
            'Если это обычный ICMP-пакет, его не нужно блокировать. Если это ICMP Flood, пакет нужно остановить.',
          ],
        },
        {
          title: '5. Какие признаки анализировать',
          list: [
            'Протокол ICMP.',
            'Количество и частота пакетов.',
            'Тип атаки.',
            'Пояснение пакета.',
            'Получает ли база урон от таких пакетов.',
          ],
        },
        {
          title: '6. Защита',
          list: [
            '<b>ICMP-фильтр</b> — специализированная защита против ICMP-угроз.',
            '<b>Rate Limiter</b> — ограничивает слишком частые запросы.',
          ],
        },
        {
          title: '7. Типичные ошибки',
          list: [
            'Блокировать весь ICMP.',
            'Не отличать одиночный диагностический пакет от flood-атаки.',
            'Использовать неподходящий модуль защиты.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>ICMP может быть диагностикой или ICMP Flood.</p>
        </div>
        <div class="mini-card">
          <h3>Подходящая защита</h3>
          <p>
            <span class="badge recommended">ICMP-фильтр</span>
            <span class="badge recommended">Rate Limiter</span>
          </p>
        </div>
        <div class="mini-card">
          <h3>Ошибка</h3>
          <p>Нельзя автоматически считать любой ICMP атакой.</p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('dns')) {
    return createMaterial(
      [
        {
          title: '1. Что такое DNS',
          paragraphs: [
            'DNS — это система доменных имён. Она преобразует понятные человеку доменные имена в IP-адреса.',
            'Например, когда пользователь вводит адрес сайта, компьютер обращается к DNS-серверу, чтобы узнать IP-адрес нужного ресурса.',
          ],
        },
        {
          title: '2. Почему DNS важен',
          paragraphs: [
            'Без DNS пользователю пришлось бы запоминать IP-адреса серверов. DNS делает интернет удобным и понятным.',
            'Если DNS недоступен, пользователь может не открыть сайт, даже если сам веб-сервер работает нормально.',
          ],
        },
        {
          title: '3. DNS и сетевые атаки',
          paragraphs: [
            'DNS может быть целью flood-атак. При DNS Flood на DNS-сервер отправляется большое количество запросов.',
            'Цель такой атаки — перегрузить DNS-сервис и нарушить доступность ресурсов.',
          ],
        },
        {
          title: '4. Признаки DNS-пакета',
          list: [
            'Часто используется порт 53.',
            'Может передаваться через UDP или TCP.',
            'Обычные DNS-запросы не должны блокироваться.',
            'Массовый поток DNS-запросов может быть атакой.',
          ],
        },
        {
          title: '5. DNS в игре',
          paragraphs: [
            'Обычный DNS-пакет нужно пропустить к серверу. Если DNS-пакет является частью DNS Flood, его нужно блокировать.',
            'Игрок должен учитывать, что DNS сам по себе не является угрозой. Опасной становится интенсивность и контекст.',
          ],
        },
        {
          title: '6. Защитные модули',
          list: [
            '<b>Rate Limiter</b> — ограничивает поток DNS-запросов.',
            '<b>DPI</b> — помогает глубже анализировать DNS-трафик.',
            '<b>IDS</b> — помогает обнаруживать подозрительное поведение.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>DNS может быть нормальным запросом или частью DNS Flood.</p>
        </div>
        <div class="mini-card">
          <h3>Что смотреть</h3>
          <p>Порт 53, частоту пакетов, тип атаки и пояснение.</p>
        </div>
        <div class="mini-card">
          <h3>Подходящая защита</h3>
          <p>
            <span class="badge recommended">Rate Limiter</span>
            <span class="badge recommended">DPI</span>
            <span class="badge recommended">IDS</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('http')) {
    return createMaterial(
      [
        {
          title: '1. Что такое HTTP',
          paragraphs: [
            'HTTP — это прикладной протокол, который используется для передачи веб-страниц, API-запросов и данных между клиентом и сервером.',
            'Когда пользователь открывает сайт, браузер отправляет HTTP-запрос, а сервер возвращает ответ.',
          ],
        },
        {
          title: '2. Где используется HTTP',
          list: [
            'Веб-страницы.',
            'REST API.',
            'Авторизация пользователей.',
            'Отправка форм.',
            'Получение JSON-данных.',
          ],
        },
        {
          title: '3. Почему HTTP может быть опасен',
          paragraphs: [
            'HTTP-запрос может выглядеть обычным, но внутри содержать вредоносную полезную нагрузку.',
            'Например, вредоносный запрос может быть направлен на эксплуатацию уязвимости веб-приложения.',
          ],
        },
        {
          title: '4. HTTP в игре',
          paragraphs: [
            'Обычный HTTP-пакет нужно пропустить к серверу. Но если HTTP-пакет содержит Malicious Payload или относится к Botnet HTTP, его нужно блокировать.',
          ],
        },
        {
          title: '5. Защита',
          list: [
            '<b>Firewall</b> — базовая фильтрация HTTP/TCP-трафика.',
            '<b>DPI</b> — анализирует содержимое HTTP-пакета.',
            '<b>IDS</b> — помогает находить подозрительные шаблоны поведения.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>HTTP может быть обычным запросом или переносить вредоносную нагрузку.</p>
        </div>
        <div class="mini-card">
          <h3>Подходящая защита</h3>
          <p>
            <span class="badge recommended">Firewall</span>
            <span class="badge recommended">DPI</span>
            <span class="badge recommended">IDS</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('firewall')) {
    return createMaterial(
      [
        {
          title: '1. Что такое Firewall',
          paragraphs: [
            'Firewall, или межсетевой экран, — это средство защиты, которое контролирует сетевой трафик между разными частями сети.',
            'Он анализирует входящие и исходящие пакеты и принимает решение: разрешить передачу данных или заблокировать её.',
            'Firewall можно представить как контрольный пункт на границе сети. Он проверяет, кто пытается подключиться, к какому сервису идёт обращение и разрешено ли это правилами безопасности.',
          ],
        },
        {
          title: '2. Зачем нужен Firewall',
          paragraphs: [
            'Серверы постоянно получают множество запросов. Часть запросов является нормальной: пользователи открывают сайт, проходят авторизацию, отправляют формы и получают данные.',
            'Но часть трафика может быть опасной: попытки подключения к закрытым портам, сканирование, подозрительные соединения или атаки.',
            'Firewall помогает не пропускать к серверу нежелательный трафик и снижает риск успешной атаки.',
          ],
        },
        {
          title: '3. По каким признакам Firewall фильтрует пакеты',
          list: [
            '<b>IP-адрес источника</b> — откуда пришёл пакет.',
            '<b>IP-адрес назначения</b> — куда направлен пакет.',
            '<b>Порт назначения</b> — к какому сервису обращается пакет.',
            '<b>Протокол</b> — TCP, UDP, ICMP, HTTP и другие.',
            '<b>Направление соединения</b> — входящий или исходящий трафик.',
            '<b>Состояние соединения</b> — новое соединение, установленное или подозрительное.',
          ],
        },
        {
          title: '4. Пример правила Firewall',
          paragraphs: [
            'Администратор может разрешить пользователям подключаться к веб-серверу по портам 80 и 443, но запретить внешний доступ к базе данных.',
          ],
          list: [
            'Разрешить HTTP: порт 80.',
            'Разрешить HTTPS: порт 443.',
            'Запретить внешний доступ к PostgreSQL: порт 5432.',
            'Запретить подозрительные подключения с неизвестных адресов.',
          ],
        },
        {
          title: '5. Firewall и ложные срабатывания',
          paragraphs: [
            'Firewall не должен блокировать весь трафик подряд. Если правило слишком строгое, оно может заблокировать нормального пользователя.',
            'В игре ложное срабатывание возникает, когда защитный модуль уничтожает обычный пакет, который должен был дойти до сервера.',
          ],
        },
        {
          title: '6. Ограничения Firewall',
          paragraphs: [
            'Firewall хорошо работает с базовой фильтрацией, но не всегда способен понять содержимое пакета.',
            'Если вредоносная нагрузка спрятана внутри обычного HTTP-запроса, может понадобиться DPI или IDS.',
          ],
        },
        {
          title: '7. Firewall в игре',
          paragraphs: [
            'В игре Firewall является базовым защитным модулем. Он помогает блокировать подозрительный TCP/HTTP-трафик и некоторые атаки, связанные с соединениями.',
            'Но Firewall не решает все проблемы. Против SYN Flood лучше использовать SYN-защиту, против вредоносной нагрузки — DPI, против flood-атак — Rate Limiter.',
          ],
        },
        {
          title: '8. Типичные ошибки игрока',
          list: [
            'Блокировать весь TCP/HTTP-трафик подряд.',
            'Использовать Firewall против атаки, где лучше подходит DPI или Rate Limiter.',
            'Не смотреть на пояснение пакета.',
            'Размещать модуль слишком далеко от маршрута.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>Роль в игре</h3>
          <p>Firewall — универсальный базовый модуль для фильтрации TCP/HTTP-трафика.</p>
        </div>
        <div class="mini-card">
          <h3>Эффективен против</h3>
          <p>
            <span class="badge recommended">TCP</span>
            <span class="badge recommended">HTTP</span>
            <span class="badge recommended">подозрительные соединения</span>
          </p>
        </div>
        <div class="mini-card">
          <h3>Ограничение</h3>
          <p>Не всегда анализирует содержимое пакета. Для этого лучше подходит DPI.</p>
        </div>
        <div class="mini-card">
          <h3>Ошибка</h3>
          <p>Если Firewall уничтожает обычный пакет, это ложное срабатывание.</p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('syn')) {
    return createMaterial(
      [
        {
          title: '1. Что такое SYN Flood',
          paragraphs: [
            'SYN Flood — это атака на механизм установки TCP-соединения.',
            'Она использует большое количество TCP-пакетов с флагом SYN.',
          ],
        },
        {
          title: '2. Как работает атака',
          paragraphs: [
            'В нормальной ситуации клиент отправляет SYN, сервер отвечает SYN-ACK, а клиент завершает соединение ACK-пакетом.',
            'При SYN Flood злоумышленник отправляет много SYN-пакетов, но не завершает соединения. Сервер хранит полуоткрытые соединения и тратит ресурсы.',
          ],
        },
        {
          title: '3. Признаки SYN Flood',
          list: [
            'Много TCP-пакетов с SYN-флагом.',
            'Мало нормальных ACK-подтверждений.',
            'Резкий рост числа полуоткрытых соединений.',
            'Повышенная нагрузка на сервер.',
          ],
        },
        {
          title: '4. SYN Flood в игре',
          paragraphs: [
            'Такие пакеты нужно блокировать до того, как они достигнут сервера. Если SYN Flood проходит до базы, база получает урон.',
          ],
        },
        {
          title: '5. Защита',
          list: [
            '<b>SYN-защита</b> — лучший модуль против этой атаки.',
            '<b>Firewall</b> — дополнительная фильтрация.',
            '<b>Rate Limiter</b> — может ограничить поток подозрительных запросов.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>SYN Flood представлен TCP-пакетами с SYN-флагом.</p>
        </div>
        <div class="mini-card">
          <h3>Защита</h3>
          <p>
            <span class="badge recommended">SYN-защита</span>
            <span class="badge recommended">Firewall</span>
          </p>
        </div>
        <div class="mini-card">
          <h3>Что смотреть</h3>
          <p>TCP-флаг SYN и тип атаки.</p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('dpi')) {
    return createMaterial(
      [
        {
          title: '1. Что такое DPI',
          paragraphs: [
            'DPI означает Deep Packet Inspection — глубокая проверка пакетов.',
            'DPI анализирует не только заголовки пакета, но и его содержимое.',
          ],
        },
        {
          title: '2. Зачем нужен DPI',
          paragraphs: [
            'Некоторые атаки выглядят как обычный трафик по протоколу и порту. Например, вредоносный HTTP-запрос может идти через стандартный порт 80.',
            'Чтобы обнаружить угрозу, нужно анализировать содержимое пакета.',
          ],
        },
        {
          title: '3. Что может обнаруживать DPI',
          list: [
            'Вредоносную полезную нагрузку.',
            'Подозрительные HTTP-запросы.',
            'Аномальные данные внутри пакета.',
            'Некоторые признаки ботнет-трафика.',
          ],
        },
        {
          title: '4. DPI в игре',
          paragraphs: [
            'DPI особенно полезен против Malicious Payload. Если пакет содержит вредоносные данные, обычного Firewall может быть недостаточно.',
          ],
        },
        {
          title: '5. Типичная ошибка',
          paragraphs: [
            'Игрок может пытаться блокировать вредоносную нагрузку неподходящим модулем. Для таких случаев лучше выбирать DPI.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>DPI анализирует содержимое пакета.</p>
        </div>
        <div class="mini-card">
          <h3>Эффективен против</h3>
          <p>
            <span class="badge recommended">Malicious Payload</span>
            <span class="badge recommended">HTTP</span>
            <span class="badge recommended">DNS</span>
          </p>
        </div>
        <div class="mini-card">
          <h3>Когда нужен</h3>
          <p>Когда опасность спрятана внутри содержимого пакета.</p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('ids')) {
    return createMaterial(
      [
        {
          title: '1. Что такое IDS',
          paragraphs: [
            'IDS — это Intrusion Detection System, система обнаружения вторжений.',
            'Она анализирует сетевую активность и ищет признаки подозрительного поведения.',
          ],
        },
        {
          title: '2. Чем IDS отличается от Firewall',
          paragraphs: [
            'Firewall обычно работает по правилам фильтрации. IDS больше ориентирована на обнаружение подозрительных шаблонов и аномального поведения.',
          ],
        },
        {
          title: '3. Что IDS может обнаруживать',
          list: [
            'Port Scan.',
            'IP Spoofing.',
            'Подозрительные последовательности запросов.',
            'Некоторые признаки вредоносной активности.',
          ],
        },
        {
          title: '4. IDS в игре',
          paragraphs: [
            'IDS полезен против атак, где важен не только протокол, но и поведение пакетов.',
            'Например, Port Scan может выглядеть как набор TCP-запросов, но IDS помогает понять, что это разведка.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>IDS помогает обнаруживать подозрительное поведение.</p>
        </div>
        <div class="mini-card">
          <h3>Эффективен против</h3>
          <p>
            <span class="badge recommended">Port Scan</span>
            <span class="badge recommended">IP Spoofing</span>
            <span class="badge recommended">Malicious Payload</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('acl')) {
    return createMaterial(
      [
        {
          title: '1. Что такое ACL',
          paragraphs: [
            'ACL — это Access Control List, список контроля доступа.',
            'Он задаёт правила, которые определяют, кому и куда разрешён доступ.',
          ],
        },
        {
          title: '2. По каким признакам работает ACL',
          list: [
            'IP-адрес источника.',
            'IP-адрес назначения.',
            'Подсеть.',
            'Порт.',
            'Протокол.',
            'Направление трафика.',
          ],
        },
        {
          title: '3. ACL в игре',
          paragraphs: [
            'ACL полезен против IP Spoofing и Port Scan. Если пакет выглядит как пришедший из неправильного источника, ACL может помочь его остановить.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>ACL фильтрует трафик по правилам доступа.</p>
        </div>
        <div class="mini-card">
          <h3>Эффективен против</h3>
          <p>
            <span class="badge recommended">IP Spoofing</span>
            <span class="badge recommended">Port Scan</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('rate')) {
    return createMaterial(
      [
        {
          title: '1. Что такое Rate Limiter',
          paragraphs: [
            'Rate Limiter — это механизм ограничения скорости или количества запросов.',
            'Он нужен для защиты от слишком интенсивного потока пакетов.',
          ],
        },
        {
          title: '2. Когда используется Rate Limiter',
          paragraphs: [
            'Rate Limiter особенно полезен против flood-атак, где опасность создаётся большим количеством пакетов за короткое время.',
          ],
        },
        {
          title: '3. Rate Limiter в игре',
          paragraphs: [
            'В игре Rate Limiter помогает против ICMP Flood, UDP Flood, DNS Flood и ботнет-атак.',
          ],
        },
        {
          title: '4. Типичная ошибка',
          paragraphs: [
            'Иногда игрок пытается использовать глубокий анализ там, где проблема в количестве пакетов. Для flood-атак часто лучше использовать Rate Limiter.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>Rate Limiter ограничивает поток пакетов.</p>
        </div>
        <div class="mini-card">
          <h3>Эффективен против</h3>
          <p>
            <span class="badge recommended">ICMP Flood</span>
            <span class="badge recommended">UDP Flood</span>
            <span class="badge recommended">DNS Flood</span>
            <span class="badge recommended">Botnet</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('port')) {
    return createMaterial(
      [
        {
          title: '1. Что такое Port Scan',
          paragraphs: [
            'Port Scan — это сканирование портов сервера с целью определить, какие сетевые службы доступны.',
            'Злоумышленник проверяет разные порты и пытается понять, где можно продолжить атаку.',
          ],
        },
        {
          title: '2. Почему это опасно',
          paragraphs: [
            'Само сканирование не всегда наносит урон, но оно помогает подготовить дальнейшую атаку.',
            'Если злоумышленник нашёл открытый порт с уязвимой службой, он может попытаться её атаковать.',
          ],
        },
        {
          title: '3. Port Scan в игре',
          paragraphs: [
            'В игре Port Scan нужно блокировать, потому что это разведка перед атакой.',
          ],
        },
        {
          title: '4. Защита',
          list: [
            '<b>IDS</b> — хорошо обнаруживает сканирование.',
            '<b>ACL</b> — помогает ограничивать доступ по правилам.',
            '<b>Firewall</b> — может закрывать ненужные порты.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>Port Scan — это разведка открытых портов.</p>
        </div>
        <div class="mini-card">
          <h3>Защита</h3>
          <p>
            <span class="badge recommended">IDS</span>
            <span class="badge recommended">ACL</span>
            <span class="badge recommended">Firewall</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('spoof')) {
    return createMaterial(
      [
        {
          title: '1. Что такое IP Spoofing',
          paragraphs: [
            'IP Spoofing — это подмена IP-адреса источника в сетевом пакете.',
            'Злоумышленник пытается скрыть реальный источник трафика или выдать себя за доверенный узел.',
          ],
        },
        {
          title: '2. Почему это опасно',
          paragraphs: [
            'Если система доверяет определённым IP-адресам, злоумышленник может попытаться обойти фильтрацию за счёт подмены источника.',
          ],
        },
        {
          title: '3. IP Spoofing в игре',
          paragraphs: [
            'В игре такие пакеты нужно блокировать, потому что они имеют признаки подмены источника.',
          ],
        },
        {
          title: '4. Защита',
          list: [
            '<b>ACL</b> — помогает фильтровать недопустимые источники.',
            '<b>IDS</b> — помогает обнаруживать подозрительное поведение.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>IP Spoofing связан с подменой адреса источника.</p>
        </div>
        <div class="mini-card">
          <h3>Защита</h3>
          <p>
            <span class="badge recommended">ACL</span>
            <span class="badge recommended">IDS</span>
          </p>
        </div>
      `
    );
  }

  if (lowerTitle.includes('payload') || lowerTitle.includes('malicious')) {
    return createMaterial(
      [
        {
          title: '1. Что такое Malicious Payload',
          paragraphs: [
            'Malicious Payload — это вредоносная полезная нагрузка внутри пакета или запроса.',
            'Опасность может находиться не в самом протоколе, а в содержимом данных.',
          ],
        },
        {
          title: '2. Почему это сложно обнаружить',
          paragraphs: [
            'Пакет может идти через обычный порт и использовать нормальный протокол, но внутри содержать вредоносные данные.',
            'Поэтому простой фильтрации по порту может быть недостаточно.',
          ],
        },
        {
          title: '3. Malicious Payload в игре',
          paragraphs: [
            'В игре такие пакеты нужно блокировать с помощью модулей, которые умеют анализировать содержимое.',
          ],
        },
        {
          title: '4. Защита',
          list: [
            '<b>DPI</b> — лучший выбор для глубокого анализа содержимого.',
            '<b>IDS</b> — помогает обнаруживать подозрительные шаблоны.',
          ],
        },
      ],
      `
        <div class="mini-card">
          <h3>В игре</h3>
          <p>Malicious Payload опасен содержимым пакета.</p>
        </div>
        <div class="mini-card">
          <h3>Защита</h3>
          <p>
            <span class="badge recommended">DPI</span>
            <span class="badge recommended">IDS</span>
          </p>
        </div>
      `
    );
  }

  return createMaterial(
    [
      {
        title: '1. Назначение темы',
        paragraphs: [
          'Эта тема помогает понять, как анализировать сетевой трафик, отличать нормальные пакеты от вредоносных и выбирать подходящие защитные механизмы.',
        ],
      },
      {
        title: '2. Как применять тему в игре',
        paragraphs: [
          'В игре нужно анализировать протокол, порт, IP-адреса, TCP-флаги, тип атаки и пояснение. Обычный трафик нужно пропускать, а вредоносный — блокировать.',
        ],
      },
      {
        title: '3. Типичные ошибки',
        list: [
          'Блокировать все пакеты подряд.',
          'Пропускать атаки до сервера.',
          'Использовать неподходящий защитный модуль.',
          'Не смотреть на признаки пакета.',
        ],
      },
      {
        title: '4. Главный вывод',
        paragraphs: [
          'Ключевой навык — не просто уничтожать трафик, а правильно классифицировать каждый пакет.',
        ],
      },
    ],
    `
      <div class="mini-card">
        <h3>В игре</h3>
        <p>Тема помогает анализировать пакеты и выбирать защиту.</p>
      </div>
      <div class="mini-card">
        <h3>Что смотреть</h3>
        <p>Протокол, порт, IP-адреса, TCP-флаги, тип атаки и пояснение.</p>
      </div>
      <div class="mini-card">
        <h3>Цель</h3>
        <p>Обычный трафик пропускать, вредоносный блокировать.</p>
      </div>
    `
  );
}

function createMaterial(sections: TopicSection[], gameCards: string): TopicMaterial {
  return {
    sections,
    gameCards,
  };
}