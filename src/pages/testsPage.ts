import { navigate } from '../main';

interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TestGroup {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: TestQuestion[];
}

const testGroups: TestGroup[] = [
  {
    id: 'protocols',
    title: 'Сетевые протоколы',
    category: 'TCP / UDP / ICMP / HTTP / DNS',
    description: 'Проверка базовых знаний о сетевых протоколах, портах и назначении протоколов.',
    questions: [
      {
        id: 1,
        question: 'Какой протокол чаще всего используется для передачи веб-страниц?',
        options: ['ICMP', 'HTTP', 'UDP', 'ARP'],
        correctIndex: 1,
        explanation: 'HTTP используется для передачи веб-страниц, API-запросов и другого веб-трафика.',
      },
      {
        id: 2,
        question: 'Какой порт обычно используется DNS?',
        options: ['22', '53', '80', '443'],
        correctIndex: 1,
        explanation: 'DNS обычно использует порт 53.',
      },
      {
        id: 3,
        question: 'Какой протокол работает без установки соединения?',
        options: ['TCP', 'UDP', 'HTTP', 'TLS'],
        correctIndex: 1,
        explanation: 'UDP не устанавливает соединение перед передачей данных.',
      },
      {
        id: 4,
        question: 'Для чего обычно используется ICMP?',
        options: [
          'Для проверки доступности узлов и диагностики сети',
          'Для загрузки веб-страниц',
          'Для шифрования паролей',
          'Для хранения файлов',
        ],
        correctIndex: 0,
        explanation: 'ICMP используется, например, в ping для проверки доступности узла.',
      },
      {
        id: 5,
        question: 'Какой протокол обеспечивает надёжную доставку данных с установкой соединения?',
        options: ['TCP', 'UDP', 'ICMP', 'DNS'],
        correctIndex: 0,
        explanation: 'TCP устанавливает соединение и контролирует доставку данных.',
      },
      {
        id: 6,
        question: 'Какой порт обычно используется HTTPS?',
        options: ['21', '53', '80', '443'],
        correctIndex: 3,
        explanation: 'HTTPS обычно использует порт 443.',
      },
      {
        id: 7,
        question: 'Какой протокол используется для преобразования доменного имени в IP-адрес?',
        options: ['DNS', 'ICMP', 'SSH', 'FTP'],
        correctIndex: 0,
        explanation: 'DNS преобразует доменные имена, например example.com, в IP-адреса.',
      },
      {
        id: 8,
        question: 'Какой протокол чаще всего используется командой ping?',
        options: ['HTTP', 'ICMP', 'TCP', 'DNS'],
        correctIndex: 1,
        explanation: 'Команда ping использует ICMP для проверки доступности узла.',
      },
      {
        id: 9,
        question: 'Что делает TCP перед передачей данных?',
        options: [
          'Устанавливает соединение',
          'Удаляет IP-адрес источника',
          'Отключает DNS',
          'Всегда шифрует трафик',
        ],
        correctIndex: 0,
        explanation: 'TCP устанавливает соединение перед передачей данных, чтобы обеспечить надёжность доставки.',
      },
      {
        id: 10,
        question: 'Какой протокол лучше подходит для быстрой передачи без гарантии доставки?',
        options: ['UDP', 'TCP', 'HTTPS', 'SSH'],
        correctIndex: 0,
        explanation: 'UDP быстрее и проще TCP, но не гарантирует доставку пакетов.',
      },
    ],
  },
  {
    id: 'attacks',
    title: 'Сетевые атаки',
    category: 'Flood / SYN Flood / Port Scan / Spoofing',
    description: 'Вопросы по типам атак, которые встречаются в игровых уровнях.',
    questions: [
      {
        id: 1,
        question: 'Что является признаком SYN Flood?',
        options: [
          'Много TCP-пакетов с SYN-флагом',
          'Много HTTP-ответов 200 OK',
          'Много обычных DNS-ответов',
          'Передача файлов по FTP',
        ],
        correctIndex: 0,
        explanation: 'SYN Flood использует большое количество TCP SYN-запросов для перегрузки сервера.',
      },
      {
        id: 2,
        question: 'Что такое Port Scan?',
        options: [
          'Шифрование сетевого трафика',
          'Поиск открытых портов на сервере',
          'Передача DNS-запросов',
          'Ускорение TCP-соединений',
        ],
        correctIndex: 1,
        explanation: 'Сканирование портов используется для поиска доступных сетевых служб.',
      },
      {
        id: 3,
        question: 'Что означает IP Spoofing?',
        options: [
          'Подмена IP-адреса источника',
          'Увеличение скорости соединения',
          'Сжатие сетевого трафика',
          'Проверка DNS-записей',
        ],
        correctIndex: 0,
        explanation: 'IP Spoofing — это подмена адреса источника для маскировки или обхода фильтрации.',
      },
      {
        id: 4,
        question: 'Что обычно происходит при UDP Flood?',
        options: [
          'Сервер получает большое количество UDP-пакетов',
          'Открывается защищённый SSH-сеанс',
          'Пользователь проходит авторизацию',
          'DNS-записи автоматически обновляются',
        ],
        correctIndex: 0,
        explanation: 'UDP Flood создаёт большую нагрузку за счёт множества UDP-пакетов.',
      },
      {
        id: 5,
        question: 'Почему Botnet-атака опаснее одиночной атаки?',
        options: [
          'Она идёт с большого количества устройств',
          'Она всегда использует только один IP-адрес',
          'Она не создаёт сетевую нагрузку',
          'Она работает только внутри локальной сети',
        ],
        correctIndex: 0,
        explanation: 'Ботнет использует множество заражённых устройств, поэтому атаку сложнее фильтровать.',
      },
      {
        id: 6,
        question: 'Что является целью ICMP Flood?',
        options: [
          'Перегрузить сервер большим количеством ICMP-запросов',
          'Ускорить работу DNS',
          'Создать нового пользователя',
          'Открыть порт 443',
        ],
        correctIndex: 0,
        explanation: 'ICMP Flood создаёт нагрузку большим количеством ICMP-пакетов.',
      },
      {
        id: 7,
        question: 'Почему DNS Flood может нарушить работу сервиса?',
        options: [
          'Из-за большого количества DNS-запросов',
          'Потому что DNS всегда запрещён',
          'Потому что DNS удаляет файлы',
          'Потому что DNS заменяет firewall',
        ],
        correctIndex: 0,
        explanation: 'DNS Flood перегружает DNS-инфраструктуру множеством запросов.',
      },
      {
        id: 8,
        question: 'Что может быть целью Malicious Payload?',
        options: [
          'Передать вредоносные данные внутри пакета',
          'Проверить скорость мыши',
          'Уменьшить размер экрана',
          'Создать обычный DNS-ответ',
        ],
        correctIndex: 0,
        explanation: 'Malicious Payload — это вредоносная полезная нагрузка внутри сетевого пакета.',
      },
      {
        id: 9,
        question: 'Какой признак может указывать на сканирование портов?',
        options: [
          'Много запросов к разным портам',
          'Один обычный HTTP-запрос',
          'Один DNS-ответ от доверенного сервера',
          'Отсутствие сетевой активности',
        ],
        correctIndex: 0,
        explanation: 'При Port Scan злоумышленник проверяет разные порты, чтобы найти открытые службы.',
      },
      {
        id: 10,
        question: 'Что делает DDoS-атака?',
        options: [
          'Создаёт распределённую нагрузку на сервис',
          'Улучшает защиту сервера',
          'Уменьшает количество пакетов',
          'Всегда является обычным трафиком',
        ],
        correctIndex: 0,
        explanation: 'DDoS создаёт нагрузку с большого количества источников и может нарушить доступность сервиса.',
      },
    ],
  },
  {
    id: 'defense',
    title: 'Защитные модули',
    category: 'Firewall / IDS / DPI / Rate Limiter / ACL',
    description: 'Проверка понимания, какой защитный модуль лучше использовать против разных угроз.',
    questions: [
      {
        id: 1,
        question: 'Какой модуль лучше подходит для анализа вредоносной полезной нагрузки?',
        options: ['Rate Limiter', 'DPI', 'ICMP-фильтр', 'SYN-защита'],
        correctIndex: 1,
        explanation: 'DPI выполняет глубокий анализ содержимого пакетов и подходит для поиска вредоносной нагрузки.',
      },
      {
        id: 2,
        question: 'Какой модуль лучше использовать против flood-атак?',
        options: ['Rate Limiter', 'Только ACL', 'Только HTTP-фильтр', 'DNS-клиент'],
        correctIndex: 0,
        explanation: 'Rate Limiter ограничивает интенсивность потока пакетов и помогает против flood-атак.',
      },
      {
        id: 3,
        question: 'Какой модуль наиболее логично использовать против SYN Flood?',
        options: ['SYN-защита', 'DNS-клиент', 'Обычный текстовый редактор', 'FTP-сервер'],
        correctIndex: 0,
        explanation: 'SYN-защита предназначена для противодействия атакам на механизм установки TCP-соединения.',
      },
      {
        id: 4,
        question: 'Для чего используется IDS?',
        options: [
          'Для обнаружения подозрительной активности',
          'Для просмотра фильмов',
          'Для хранения изображений',
          'Для увеличения размера пакета',
        ],
        correctIndex: 0,
        explanation: 'IDS обнаруживает подозрительные действия, например сканирование портов или признаки атаки.',
      },
      {
        id: 5,
        question: 'Что делает Firewall?',
        options: [
          'Фильтрует сетевой трафик по правилам',
          'Создаёт игровые уровни',
          'Увеличивает яркость экрана',
          'Удаляет базу данных',
        ],
        correctIndex: 0,
        explanation: 'Firewall пропускает или блокирует трафик на основе правил фильтрации.',
      },
      {
        id: 6,
        question: 'Какой модуль лучше использовать против Port Scan?',
        options: ['IDS', 'DNS-клиент', 'Обычный браузер', 'Текстовый редактор'],
        correctIndex: 0,
        explanation: 'IDS помогает обнаруживать подозрительную активность, включая сканирование портов.',
      },
      {
        id: 7,
        question: 'Какой модуль может фильтровать трафик по IP-адресам и правилам доступа?',
        options: ['ACL-фильтр', 'ICMP', 'HTTP', 'Ping'],
        correctIndex: 0,
        explanation: 'ACL-фильтр использует правила доступа, например по IP-адресам или направлениям трафика.',
      },
      {
        id: 8,
        question: 'Почему Firewall считается базовым модулем защиты?',
        options: [
          'Он фильтрует входящий и исходящий трафик по правилам',
          'Он всегда заменяет все остальные средства защиты',
          'Он создаёт игровые уровни',
          'Он отключает интернет',
        ],
        correctIndex: 0,
        explanation: 'Firewall — базовый механизм фильтрации трафика на основе правил.',
      },
      {
        id: 9,
        question: 'Какой модуль лучше подходит против DNS Flood?',
        options: ['Rate Limiter', 'SYN-защита', 'FTP-сервер', 'Графический редактор'],
        correctIndex: 0,
        explanation: 'Rate Limiter ограничивает интенсивность запросов и помогает против flood-атак.',
      },
      {
        id: 10,
        question: 'Почему одного Firewall может быть недостаточно против Malicious Payload?',
        options: [
          'Нужно анализировать содержимое пакета, а это лучше делает DPI',
          'Firewall не существует',
          'Malicious Payload всегда является обычным трафиком',
          'Firewall работает только с изображениями',
        ],
        correctIndex: 0,
        explanation: 'Для анализа содержимого пакетов нужен DPI, потому что Firewall чаще работает по правилам фильтрации.',
      },
    ],
  },
  {
    id: 'classification',
    title: 'Классификация трафика',
    category: 'Нормальный трафик / угрозы / ошибки',
    description: 'Тест по игровой логике: что блокировать, что пропускать и как считаются ошибки.',
    questions: [
      {
        id: 1,
        question: 'Что считается ложным срабатыванием в игре?',
        options: [
          'Атака была заблокирована',
          'Обычный пакет был ошибочно заблокирован',
          'Обычный пакет дошёл до сервера',
          'Пользователь установил башню',
        ],
        correctIndex: 1,
        explanation: 'Ложное срабатывание — это блокировка нормального трафика.',
      },
      {
        id: 2,
        question: 'Что должно происходить с обычным сетевым трафиком?',
        options: [
          'Его нужно всегда уничтожать',
          'Его нужно пропускать к серверу',
          'Он всегда наносит урон базе',
          'Он должен превращаться в атаку',
        ],
        correctIndex: 1,
        explanation: 'Обычный трафик должен доходить до сервера. Блокировать его не нужно.',
      },
      {
        id: 3,
        question: 'Что происходит, если вредоносный пакет дошёл до сервера?',
        options: [
          'База получает урон',
          'Игрок получает бонус',
          'Уровень сразу становится легче',
          'Пакет становится обычным',
        ],
        correctIndex: 0,
        explanation: 'Если атака дошла до сервера, база получает урон, а это считается пропущенной угрозой.',
      },
      {
        id: 4,
        question: 'Что означает высокая точность классификации?',
        options: [
          'Игрок правильно отличает обычный трафик от вредоносного',
          'Игрок уничтожает все пакеты подряд',
          'Игрок не ставит защитные модули',
          'Игрок всегда проигрывает уровень',
        ],
        correctIndex: 0,
        explanation: 'Точность показывает, насколько правильно пользователь принимал решения по пакетам.',
      },
      {
        id: 5,
        question: 'Какое действие является правильной блокировкой?',
        options: [
          'Блокировка вредоносного пакета',
          'Блокировка обычного HTTP-запроса',
          'Пропуск SYN Flood до сервера',
          'Удаление всех башен',
        ],
        correctIndex: 0,
        explanation: 'Правильная блокировка — это уничтожение вредоносного пакета до достижения сервера.',
      },
      {
        id: 6,
        question: 'Что считается правильным пропуском?',
        options: [
          'Обычный пакет дошёл до сервера',
          'Атака дошла до сервера',
          'Обычный пакет был уничтожен',
          'Башня была удалена',
        ],
        correctIndex: 0,
        explanation: 'Правильный пропуск — это когда нормальный трафик не блокируется и доходит до сервера.',
      },
      {
        id: 7,
        question: 'Что ухудшает итоговую точность классификации?',
        options: [
          'Ложные срабатывания и пропущенные угрозы',
          'Правильные блокировки',
          'Правильный пропуск обычного трафика',
          'Открытие страницы обучения',
        ],
        correctIndex: 0,
        explanation: 'Ошибки классификации — это ложные срабатывания и пропущенные угрозы.',
      },
      {
        id: 8,
        question: 'Почему нельзя уничтожать все пакеты подряд?',
        options: [
          'Потому что среди них есть нормальный трафик',
          'Потому что атаки всегда полезны',
          'Потому что сервер должен получать урон',
          'Потому что башни нельзя ставить',
        ],
        correctIndex: 0,
        explanation: 'В реальной сети важно не только блокировать атаки, но и не мешать нормальному трафику.',
      },
      {
        id: 9,
        question: 'Что означает показатель “Ложные срабатывания”?',
        options: [
          'Количество ошибочно заблокированных обычных пакетов',
          'Количество всех пройденных уровней',
          'Количество созданных пользователей',
          'Количество установленных тем',
        ],
        correctIndex: 0,
        explanation: 'Ложное срабатывание — это блокировка нормального трафика как вредоносного.',
      },
      {
        id: 10,
        question: 'Что означает показатель “Пропущенные угрозы”?',
        options: [
          'Вредоносные пакеты, которые дошли до сервера',
          'Обычные пакеты, которые дошли до сервера',
          'Все пакеты на карте',
          'Количество тестовых вопросов',
        ],
        correctIndex: 0,
        explanation: 'Пропущенная угроза — это атака, которую защита не остановила до сервера.',
      },
    ],
  },
];

export function renderTestsPage(app: HTMLDivElement): void {
  renderTestList(app);
}

function renderTestList(app: HTMLDivElement): void {
  app.innerHTML = `
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-logo"></div>
          <div>
            <div class="brand-title">Тесты для закрепления</div>
            <div class="brand-subtitle">Проверка знаний по кибербезопасности</div>
          </div>
        </div>

        <div class="nav-actions">
          <button class="button secondary" id="backButton">Назад к обучению</button>
        </div>
      </div>

      <div class="card hero">
        <div>
          <div class="hero-kicker">🧠 Самопроверка</div>
          <h1 class="glow-text">Выберите тест</h1>
          <p>
            Здесь можно закрепить знания по сетевым протоколам, атакам,
            защитным модулям и игровой классификации трафика.
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
        <h2>Доступные тесты</h2>

        <div class="grid">
          ${testGroups.map(test => `
            <div class="mini-card test-group-card">
              <div class="badge">${test.category}</div>
              <h3>${test.title}</h3>
              <p>${test.description}</p>
              <p><b>Вопросов:</b> ${test.questions.length}</p>
              <button class="button" data-test-id="${test.id}">Начать тест</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#backButton')?.addEventListener('click', () => {
    navigate('topics');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-test-id]').forEach(button => {
    button.addEventListener('click', () => {
      const testId = String(button.dataset.testId);
      const test = testGroups.find(item => item.id === testId);

      if (test) {
        renderSelectedTest(app, test);
      }
    });
  });
}


function renderSelectedTest(
  app: HTMLDivElement,
  test: TestGroup
): void {

  let currentIndex = 0;
  let selectedIndex: number | null = null;
  let correctAnswers = 0;

  const userAnswers:
    Array<number | null> = [];

  const randomizedQuestions =
    test.questions.map(question => {

      const shuffled =
        question.options
          .map((option, index) => ({
            option,
            isCorrect:
              index === question.correctIndex
          }))
          .sort(() => Math.random() - 0.5);

      return {
        ...question,
        options:
          shuffled.map(x => x.option),

        correctIndex:
          shuffled.findIndex(
            x => x.isCorrect
          )
      };
    });

  function renderQuestion(): void {
const question =
  randomizedQuestions[currentIndex];
      selectedIndex = userAnswers[currentIndex] ?? null;

    app.innerHTML = `
      <div class="app">
        <div class="topbar">
          <div class="brand">
            <div class="brand-logo"></div>
            <div>
              <div class="brand-title">${test.title}</div>
              <div class="brand-subtitle">${test.category}</div>
            </div>
          </div>

          <div class="nav-actions">
            <button class="button secondary" id="backToTestsButton">К списку тестов</button>
          </div>
        </div>

        <div class="card test-card">
          <div class="badge">Вопрос ${currentIndex + 1} из ${test.questions.length}</div>
          <h2>${question.question}</h2>

          <div class="test-options">
            ${question.options.map((option, index) => `
              <button
                class="test-option ${selectedIndex === index ? 'selected' : ''}"
                data-option-index="${index}"
              >
                <span>${String.fromCharCode(65 + index)}</span>
                ${option}
              </button>
            `).join('')}
          </div>

          <div class="test-progress">
            <div class="test-progress-line">
              <div style="width: ${Math.round(((currentIndex + 1) / test.questions.length) * 100)}%"></div>
            </div>
            <span>${currentIndex + 1}/${test.questions.length}</span>
          </div>

          <div class="test-actions">
            <button class="button secondary" id="previousQuestionButton" ${currentIndex === 0 ? 'disabled' : ''}>
              Назад
            </button>

            <button class="button" id="nextQuestionButton">
              ${currentIndex === test.questions.length - 1 ? 'Завершить тест' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backToTestsButton')?.addEventListener('click', () => {
      renderTestList(app);
    });

    document.querySelectorAll<HTMLButtonElement>('.test-option').forEach(button => {
      button.addEventListener('click', () => {
        selectedIndex = Number(button.dataset.optionIndex);
        userAnswers[currentIndex] = selectedIndex;
        renderQuestion();
      });
    });

    document.querySelector<HTMLButtonElement>('#previousQuestionButton')?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        renderQuestion();
      }
    });

    document.querySelector<HTMLButtonElement>('#nextQuestionButton')?.addEventListener('click', () => {
      if (selectedIndex === null) {
        alert('Выберите вариант ответа.');
        return;
      }

      userAnswers[currentIndex] = selectedIndex;

      if (currentIndex === test.questions.length - 1) {
        renderResult();
        return;
      }

      currentIndex += 1;
      renderQuestion();
    });
  }

  function renderResult(): void {
    correctAnswers =
  randomizedQuestions.reduce((sum, question, index) => {
      return sum + (userAnswers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    const percent = Math.round((correctAnswers / test.questions.length) * 100);

    app.innerHTML = `
      <div class="app">
        <div class="topbar">
          <div class="brand">
            <div class="brand-logo"></div>
            <div>
              <div class="brand-title">Результат теста</div>
              <div class="brand-subtitle">${test.title}</div>
            </div>
          </div>

          <div class="nav-actions">
            <button class="button secondary" id="backToTestsButton">К списку тестов</button>
          </div>
        </div>

        <div class="card hero">
          <div>
            <div class="hero-kicker">📊 Итог самопроверки</div>
            <h1 class="glow-text">${percent}% правильных ответов</h1>
            <p>
              Тест: <b>${test.title}</b>.
              Правильных ответов: <b>${correctAnswers}</b> из <b>${test.questions.length}</b>.
            </p>
            <p>${getTestRecommendation(percent)}</p>
          </div>

          <div class="hero-panel">
            <div class="hero-line"></div>
            <div class="hero-node"></div>
            <div class="hero-node"></div>
            <div class="hero-node"></div>
          </div>
        </div>

        <div class="card">
          <h2>Разбор ответов</h2>

          <div class="test-review-list">
            ${randomizedQuestions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctIndex;

              return `
                <div class="test-review-item ${isCorrect ? 'correct' : 'wrong'}">
                  <h3>${index + 1}. ${question.question}</h3>
                  <p>
                    Ваш ответ:
                    <b>${userAnswer === null ? 'нет ответа' : question.options[userAnswer]}</b>
                  </p>
                  <p>
                    Правильный ответ:
                    <b>${question.options[question.correctIndex]}</b>
                  </p>
                  <p>${question.explanation}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card tutorial-actions-card">
          <button class="button secondary" id="backToTestsButtonBottom">К списку тестов</button>
          <button class="button" id="restartTestButton">Пройти ещё раз</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backToTestsButton')?.addEventListener('click', () => {
      renderTestList(app);
    });

    document.querySelector<HTMLButtonElement>('#backToTestsButtonBottom')?.addEventListener('click', () => {
      renderTestList(app);
    });

    document.querySelector<HTMLButtonElement>('#restartTestButton')?.addEventListener('click', () => {
      currentIndex = 0;
      selectedIndex = null;
      correctAnswers = 0;
      userAnswers.length = 0;
      renderQuestion();
    });
  }

  renderQuestion();
}

function getTestRecommendation(percent: number): string {
  if (percent >= 90) {
    return 'Отличный результат. Можно переходить к сложным уровням и комплексным атакам.';
  }

  if (percent >= 70) {
    return 'Хороший результат. Рекомендуется повторить вопросы, где были ошибки.';
  }

  if (percent >= 50) {
    return 'Базовое понимание есть, но стоит повторить учебные темы перед сложными уровнями.';
  }

  return 'Рекомендуется повторить учебные темы перед прохождением уровней.';
}