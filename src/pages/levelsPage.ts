import { getLevels, getMe, logout, refreshToken, getMyStatistics} from '../api/client';
import { navigate } from '../main';

export async function renderLevelsPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Уровни</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
  await refreshToken();

    const [user, levels, statistics] = await Promise.all([
      
      getMe(),
      getLevels(),
      getMyStatistics(),
    ]);

    const finalTestUnlocked =
  statistics.levels_completed >= levels.length;

    const campaignOrder = [
  'Базовая кампания',
  'Продвинутая кампания',
  'Экспертная кампания',
  'Пользовательская кампания',
];

const groupedLevels = campaignOrder
  .map(campaign => {
    return {
      campaign,
      levels: levels.filter(level => level.campaign === campaign),
    };
  })
  .filter(group => group.levels.length > 0);

const levelsWithoutCampaign = levels.filter(level => !level.campaign);

if (levelsWithoutCampaign.length > 0) {
  groupedLevels.push({
    campaign: 'Без кампании',
    levels: levelsWithoutCampaign,
  });
}

   app.innerHTML = `
  <div class="app">
    <div class="topbar">
      <div class="brand">
        <div class="brand-logo"></div>
        <div>
          <div class="brand-title">Cyber Defense TD</div>
          <div class="brand-subtitle">Обучающая система по кибербезопасности</div>
        </div>
      </div>

      <div class="nav-actions">
        <button class="button secondary" id="aboutButton">О проекте</button>
        <button class="button secondary" id="topicsButton">Обучение</button>
        <button class="button secondary" id="testsButton">Тесты</button>
<button
  class="button secondary"
  id="finalTestButton"
  ${!finalTestUnlocked ? 'disabled' : ''}
>
   Итоговый тест
</button>
        <button class="button secondary" id="profileButton">Профиль</button>
        <button class="button secondary" id="resultsButton">Результаты</button>
        <button class="button secondary" id="leaderboardButton">Рейтинг</button>
        ${user.role === 'teacher' ? '<button class="button secondary" id="teacherButton">Панель преподавателя</button>' : ''}
        ${user.role === 'admin' ? '<button class="button secondary" id="adminButton">Админ-панель</button>' : ''}
        <button class="button danger" id="logoutButton">Выйти</button>
      </div>
    </div>

    <div class="card hero">
      <div>
        <div class="hero-kicker">🛡️ Tower Defense + Network Security</div>
        <h1 class="glow-text">Защити сервер от сетевых атак</h1>
        <p>
  Развёртывай реальные средства сетевой защиты:
  ACL маршрутизатора, Stateful Firewall, Anti-DDoS,
  Snort IPS, DNS Filter, WAF и Email Security Gateway.
  Анализируй сетевые пакеты и отражай современные кибератаки.
</p>
        <p>Пользователь: <b>${user.username}</b> | Роль: <b>${user.role}</b></p>
      </div>

      <div class="hero-panel">
        <div class="hero-line"></div>
        <div class="hero-node"></div>
        <div class="hero-node"></div>
        <div class="hero-node"></div>
      </div>
    </div>

    <div class="page-title-row">
      <div>
        <h2>Доступные уровни</h2>
        <p>Выбери сценарий атаки и попробуй защитить сервер.</p>
      </div>
    </div>

    ${groupedLevels.map(group => `
  <div class="card campaign-section">
    <div class="page-title-row">
      <div>
        <h2>${group.campaign}</h2>
        <p>${getCampaignDescription(group.campaign)}</p>
      </div>

      <span class="badge">${group.levels.length} уровней</span>
    </div>

    <div class="grid">
      ${group.levels.map(level => `
        <div class="mini-card level-card">
          <div class="level-meta">
            <span class="badge">Уровень ${level.order_number}</span>
            <span class="badge">${level.difficulty}</span>
            <span class="badge">${level.topic || 'Тема не указана'}</span>
          </div>

          <h3>${level.title}</h3>
          <p>${level.description || ''}</p>

          <div class="level-stats">
            <div class="level-stat">
              <span>Здоровье базы</span>
              <b>${level.base_health}</b>
            </div>

            <div class="level-stat">
              <span>Ресурсы</span>
              <b>${level.start_resources}</b>
            </div>
          </div>

          <button class="button" data-level-id="${level.id}">
            Открыть уровень
          </button>
        </div>
      `).join('')}
    </div>
  </div>
`).join('')}

  </div>
`;


    document.querySelector<HTMLButtonElement>('#aboutButton')!.addEventListener('click', () => {
  navigate('about');
});

document.querySelector<HTMLButtonElement>('#testsButton')?.addEventListener('click', () => {
  navigate('tests');
});

document.querySelector<HTMLButtonElement>('#finalTestButton')?.addEventListener('click', () => {
  navigate('final-test');
});


    document.querySelector<HTMLButtonElement>('#topicsButton')!.addEventListener('click', () => {
      navigate('topics');
    });

    document.querySelector<HTMLButtonElement>('#profileButton')!.addEventListener('click', () => {
      navigate('profile');
    });

    document.querySelector<HTMLButtonElement>('#resultsButton')!.addEventListener('click', () => {
     navigate('results');
    });

    document.querySelector<HTMLButtonElement>('#leaderboardButton')!.addEventListener('click', () => {
  navigate('leaderboard');
});

    const teacherButton = document.querySelector<HTMLButtonElement>('#teacherButton');

if (teacherButton) {
  teacherButton.addEventListener('click', () => {
    navigate('teacher');
  });
}

    const adminButton = document.querySelector<HTMLButtonElement>('#adminButton');

    if (adminButton) {
        adminButton.addEventListener('click', () => {
        navigate('admin');
    });
    }

    document.querySelector<HTMLButtonElement>('#logoutButton')!.addEventListener('click', () => {
      logout();
      navigate('login');
    });

    document.querySelectorAll<HTMLButtonElement>('[data-level-id]').forEach(button => {
    button.addEventListener('click', () => {
    const levelId = Number(button.dataset.levelId);
    navigate('game', { levelId });
  });
  });
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка</h1>
          <p class="error">${(error as Error).message}</p>
          <button class="button" id="backButton">Вернуться ко входу</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('login');
    });
  }
}

function getCampaignDescription(campaign: string): string {
  if (campaign === 'Базовая кампания') {
return 'Изучение сетевых протоколов, маршрутизации и базовой фильтрации трафика.';  }

  if (campaign === 'Продвинутая кампания') {
return 'Противодействие flood-атакам, сканированию портов и подмене IP-адресов.';  }

  if (campaign === 'Экспертная кампания') {
return 'Защита веб-приложений, DNS-инфраструктуры и электронной почты от современных угроз.';  }

  if (campaign === 'Пользовательская кампания') {
    return 'Уровни, созданные администратором через панель управления.';
  }

  return 'Дополнительные игровые уровни.';
}