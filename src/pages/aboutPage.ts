import { navigate } from '../main';

export function renderAboutPage(app: HTMLDivElement): void {
  app.innerHTML = `
    <div class="app">
      <div class="topbar">
        <div class="brand">
          <div class="brand-logo"></div>
          <div>
            <div class="brand-title">О проекте</div>
            <div class="brand-subtitle">Cyber Defense TD</div>
          </div>
        </div>

        <div class="nav-actions">
          <button class="button secondary" id="backButton">Назад к уровням</button>
        </div>
      </div>

      <div class="card hero">
        <div>
          <div class="hero-kicker">🛡️ Обучающая игра по кибербезопасности</div>
          <h1 class="glow-text">Cyber Defense TD</h1>
          <p>
            Cyber Defense TD — это веб-приложение в жанре Tower Defense,
            предназначенное для изучения сетевых протоколов, сетевых угроз
            и базовых механизмов защиты информационных систем.
          </p>
          <p>
            Пользователь анализирует сетевые пакеты, размещает защитные модули,
            блокирует вредоносный трафик и старается не мешать нормальной работе сервера.
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
        <h2>Цель проекта</h2>
        <p>
          Цель приложения — сделать изучение сетевой безопасности более наглядным.
          Вместо обычного чтения теории пользователь видит сетевые пакеты как игровые объекты,
          анализирует их параметры и применяет защитные механизмы на практике.
        </p>
      </div>

      <div class="card">
        <h2>Основные возможности</h2>

        <div class="grid">
          <div class="mini-card">
            <h3>Учебные темы</h3>
            <p>
              В приложении есть материалы по TCP, UDP, ICMP, HTTP, DNS,
              сетевым атакам и защитным механизмам.
            </p>
          </div>

          <div class="mini-card">
            <h3>Игровые уровни</h3>
            <p>
              Уровни разделены на кампании. Сложность постепенно увеличивается:
              от обычных пакетов до смешанных атак и ботнет-сценариев.
            </p>
          </div>

          <div class="mini-card">
            <h3>Анализ пакетов</h3>
            <p>
              Игрок может посмотреть протокол, IP-адрес источника, IP назначения,
              порт, TCP-флаги, тип атаки и пояснение.
            </p>
          </div>

          <div class="mini-card">
            <h3>Защитные модули</h3>
            <p>
              Используются Firewall, Rate Limiter, ACL, IDS, DPI,
              SYN-защита и фильтры по протоколам.
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Моделируемые угрозы</h2>

        <div class="grid">
          <div class="mini-card">
            <h3>ICMP Flood</h3>
            <p>Большое количество ICMP-запросов, которые могут перегрузить сервер.</p>
          </div>

          <div class="mini-card">
            <h3>UDP Flood</h3>
            <p>Массовая отправка UDP-пакетов без установки соединения.</p>
          </div>

          <div class="mini-card">
            <h3>SYN Flood</h3>
            <p>Атака на механизм установки TCP-соединения через SYN-запросы.</p>
          </div>

          <div class="mini-card">
            <h3>Port Scan</h3>
            <p>Попытка определить открытые порты и доступные сетевые службы.</p>
          </div>

          <div class="mini-card">
            <h3>IP Spoofing</h3>
            <p>Подмена IP-адреса источника для обхода фильтрации или маскировки атаки.</p>
          </div>

          <div class="mini-card">
            <h3>Malicious Payload</h3>
            <p>Вредоносная полезная нагрузка внутри сетевого пакета.</p>
          </div>

          <div class="mini-card">
            <h3>DNS Flood</h3>
            <p>Массовые DNS-запросы, создающие нагрузку на инфраструктуру.</p>
          </div>

          <div class="mini-card">
            <h3>Botnet</h3>
            <p>Распределённая атака с большого количества заражённых устройств.</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Как оценивается прохождение</h2>

        <div class="grid">
          <div class="mini-card">
            <h3>Правильные блокировки</h3>
            <p>Считаются случаи, когда пользователь заблокировал вредоносный пакет.</p>
          </div>

          <div class="mini-card">
            <h3>Разрешённый трафик</h3>
            <p>Обычный трафик должен доходить до сервера и не должен блокироваться.</p>
          </div>

          <div class="mini-card">
            <h3>Ложные срабатывания</h3>
            <p>Если обычный пакет был заблокирован, это считается ошибкой фильтрации.</p>
          </div>

          <div class="mini-card">
            <h3>Пропущенные угрозы</h3>
            <p>Если вредоносный пакет дошёл до сервера, база получает урон.</p>
          </div>

          <div class="mini-card">
            <h3>Точность классификации</h3>
            <p>
              Итоговая точность показывает, насколько правильно пользователь
              отличал обычный трафик от атакующего.
            </p>
          </div>

          <div class="mini-card">
            <h3>Достижения</h3>
            <p>
              За успешные действия пользователь получает достижения:
              первый уровень, высокая точность, минимальный урон и другие.
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Роли пользователей</h2>

        <div class="grid">
          <div class="mini-card">
            <h3>Пользователь</h3>
            <p>
              Проходит уровни, изучает темы, смотрит историю результатов,
              статистику и достижения.
            </p>
          </div>

          <div class="mini-card">
            <h3>Преподаватель</h3>
            <p>
              Просматривает учебную аналитику, результаты обучающихся,
              точность классификации и типичные ошибки.
            </p>
          </div>

          <div class="mini-card">
            <h3>Администратор</h3>
            <p>
              Управляет уровнями, учебными темами, просматривает пользователей,
              результаты и общую статистику.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  
  document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
    navigate('levels');
  });
}