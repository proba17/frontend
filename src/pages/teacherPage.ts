import {
  getMe,
  getTeacherResults,
  getTeacherStatistics,
  getTeacherUsers,
  getTeacherTestResults,
} from '../api/client';
import { navigate } from '../main';

export async function renderTeacherPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Панель преподавателя</h1>
        <p>Загрузка данных...</p>
      </div>
    </div>
  `;

  try {
    const user = await getMe();

    if (user.role !== 'teacher' && user.role !== 'admin') {
      app.innerHTML = `
        <div class="app">
          <div class="card">
            <h1>Доступ запрещён</h1>
            <p class="error">Эта страница доступна только преподавателю или администратору.</p>
            <button class="button" id="backButton">Назад к уровням</button>
          </div>
        </div>
      `;

      
      document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
        navigate('levels');
      });

      return;
    }

    const [statistics, users, results, testResults] = await Promise.all([
  getTeacherStatistics(),
  getTeacherUsers(),
  getTeacherResults(),
  getTeacherTestResults(),
]);

    const averageAccuracy = results.length === 0
      ? 0
      : Math.round(
          results.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) / results.length
        );

    const totalFalsePositives = results.reduce((sum, item) => {
      return sum + Number(item.false_positives || 0);
    }, 0);

    const totalCorrectBlocks = results.reduce((sum, item) => {
      return sum + Number(item.correct_blocks || 0);
    }, 0);

    app.innerHTML = `
      <div class="app">
        <div class="topbar">
          <div class="brand">
            <div class="brand-logo"></div>
            <div>
              <div class="brand-title">Панель преподавателя</div>
              <div class="brand-subtitle">Анализ результатов и ошибок обучающихся</div>
            </div>
          </div>

          <div class="nav-actions">
            <button class="button secondary" id="exportTeacherResultsButton">Экспорт CSV</button>
            <button class="button secondary" id="backButton">Назад к уровням</button>
          </div>
        </div>

        <div class="card">
          <div class="hero-kicker">👨‍🏫 Преподаватель: ${user.username}</div>
          <h1 class="glow-text">Учебная аналитика</h1>
          <p>
            Здесь можно оценить результаты прохождения уровней, точность классификации трафика,
            количество ложных срабатываний и успешных блокировок угроз.
          </p>
        </div>

        <div class="card">
          <h2>Общая статистика обучения</h2>

          <div class="stats-grid">
            <div class="stat-card">
              <span>Пользователей</span>
              <b>${statistics.users_count}</b>
            </div>

            <div class="stat-card">
              <span>Результатов</span>
              <b>${statistics.results_count}</b>
            </div>

            <div class="stat-card">
              <span>Пройдено уровней</span>
              <b>${statistics.completed_levels_count}</b>
            </div>

            <div class="stat-card">
              <span>Средний счёт</span>
              <b>${statistics.average_score}</b>
            </div>

            <div class="stat-card">
              <span>Средняя точность</span>
<b>${statistics.average_accuracy || 0}%</b>
            </div>

            <div class="stat-card">
              <span>Ложные срабатывания</span>
<b>${statistics.total_false_positives || 0}</b>
            </div>

            <div class="stat-card">
              <span>Правильные блокировки</span>
<b>${statistics.total_correct_blocks || 0}</b>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Пользователи</h2>

          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Логин</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(item => `
                  <tr>
                    <td>${item.id}</td>
                    <td>${item.username}</td>
                    <td>${item.email}</td>
                    <td>${item.role}</td>
                    <td>${new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h2>Результаты обучающихся</h2>

          ${
            results.length === 0
              ? '<p>Результатов пока нет.</p>'
              : `
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Пользователь</th>
                        <th>Уровень</th>
                        <th>Очки</th>
                        <th>Статус</th>
                        <th>Прав. блок.</th>
                        <th>Норм. трафик</th>
                        <th>Ложн.</th>
                        <th>Точность</th>
                        <th>Урон</th>
                        <th>Время</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${results.map(item => `
                        <tr>
                          <td>${item.id}</td>
                          <td>${item.user_id}</td>
                          <td>${item.level_id}</td>
                          <td>${item.score}</td>
                          <td>${item.completed === 1 ? 'Пройден' : 'Не пройден'}</td>
                          <td>${item.correct_blocks}</td>
                          <td>${item.allowed_normal_traffic}</td>
                          <td>${item.false_positives}</td>
                          <td>${item.accuracy}%</td>
                          <td>${item.damage_taken}</td>
                          <td>${item.time_spent} сек.</td>
                        </tr>
                        
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                
              `
          }
        </div>
        
      </div>
    `;

    

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('levels');
    });

    const exportButton = document.querySelector<HTMLButtonElement>('#exportTeacherResultsButton');

if (exportButton) {
  exportButton.addEventListener('click', () => {
    exportTeacherResultsToCsv(results as unknown as Array<Record<string, unknown>>);
  });
}
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки панели преподавателя</h1>
          <p class="error">${(error as Error).message}</p>
          <button class="button" id="backButton">Назад</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('levels');
    });

    
  }
}

function exportTeacherResultsToCsv(results: Array<Record<string, unknown>>): void {
  if (results.length === 0) {
    alert('Нет результатов для экспорта.');
    return;
  }

  const headers = [
    'id',
    'user_id',
    'level_id',
    'score',
    'completed',
    'enemies_destroyed',
    'correct_blocks',
    'allowed_normal_traffic',
    'false_positives',
    'accuracy',
    'damage_taken',
    'time_spent',
    'created_at',
  ];

  const rows = results.map(result => {
    return headers.map(header => {
      const value = result[header];

      if (value === null || value === undefined) {
        return '';
      }

      return `"${String(value).replaceAll('"', '""')}"`;
    }).join(',');
  });

  const csv = [
    headers.join(','),
    ...rows,
  ].join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'teacher_results_export.csv';
  link.click();

  URL.revokeObjectURL(url);
}

