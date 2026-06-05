import {
  deleteTopic,
  deleteLevel,
  getAdminResults,
  getAdminStatistics,
  getAdminUsers,
  getLevels,
  getMe,
  getTopics,
  updateUserRole,
} from '../api/client';

import { navigate } from '../main';

export async function renderAdminPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Панель администратора</h1>
        <p>Загрузка данных...</p>
      </div>
    </div>
  `;

  try {
    const user = await getMe();

    if (user.role !== 'admin') {
      app.innerHTML = `
        <div class="app">
          <div class="topbar">
  <div class="brand">
    <div class="brand-logo"></div>
    <div>
      <div class="brand-title">Админ-панель</div>
      <div class="brand-subtitle">Управление уровнями, темами и статистикой</div>
    </div>
  </div>

  <div class="nav-actions">
    <button class="button" id="createLevelButton">Создать уровень</button>
<button class="button" id="createTopicButton">Создать тему</button>
<button class="button secondary" id="exportResultsButton">Экспорт CSV</button>
<button class="button secondary" id="backButton">Назад к уровням</button>
  </div>
</div>

<div class="card">
  <div class="hero-kicker">👤 Администратор: ${user.username}</div>
  <h1 class="glow-text">Центр управления приложением</h1>
  <p>
    Здесь можно просматривать пользователей, результаты прохождений,
    управлять учебными темами и игровыми уровнями.
  </p>
</div>
        </div>
      `;

      document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
        navigate('levels');
      });

      return;
    }

    const [statistics, users, results, levels, topics] = await Promise.all([
     getAdminStatistics(),
     getAdminUsers(),
     getAdminResults(),
    getLevels(),
    getTopics(),
    ]);

    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Панель администратора</h1>
          <p>Администратор: <b>${user.username}</b></p>
          <button class="button" id="createLevelButton">Создать уровень</button>
          <button class="button" id="createTopicButton">Создать тему</button>
            <button class="button secondary" id="exportResultsButton">Экспорт CSV</button>
          <button class="button secondary" id="backButton">Назад к уровням</button>
        </div>

        <div class="card">
          <h2>Общая статистика</h2>

          <div class="stats-grid">
            <div class="stat-card">
              <span>Пользователей</span>
              <b>${statistics.users_count}</b>
            </div>

            <div class="stat-card">
              <span>Активных уровней</span>
              <b>${statistics.levels_count}</b>
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
              <span>Лучший счёт</span>
              <b>${statistics.best_score}</b>
            </div>
          </div>
        </div>
        <div class="card">
          <h2>Управление уровнями</h2>

          ${
            levels.length === 0
              ? '<p>Уровней пока нет.</p>'
              : `
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Тема</th>
                        <th>Сложность</th>
                        <th>Здоровье базы</th>
                        <th>Ресурсы</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${levels.map(level => `
                        <tr>
                          <td>${level.id}</td>
                          <td>${level.title}</td>
                          <td>${level.topic || '-'}</td>
                          <td>${level.difficulty}</td>
                          <td>${level.base_health}</td>
                          <td>${level.start_resources}</td>
                          <td>
                            <button class="button small" data-edit-level-id="${level.id}">
                              Изменить
                            </button>
                            <button class="button danger small" data-delete-level-id="${level.id}">
                              Отключить
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
          }

                  <div class="card">
          <h2>Управление учебными темами</h2>

          ${
            topics.length === 0
              ? '<p>Тем пока нет.</p>'
              : `
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Порядок</th>
                        <th>Краткое описание</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${topics.map(topic => `
                        <tr>
                          <td>${topic.id}</td>
                          <td>${topic.title}</td>
                          <td>${topic.category || '-'}</td>
                          <td>${topic.order_number}</td>
                          <td>${topic.short_description || '-'}</td>
                          <td>
                            <button class="button small" data-edit-topic-id="${topic.id}">
                              Изменить
                            </button>
                            <button class="button danger small" data-delete-topic-id="${topic.id}">
                              Отключить
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
          }
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
                  <th>Изменить роль</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(item => `
                  <tr>
                    <td>${item.id}</td>
<td>${item.username}</td>
<td>${item.email}</td>
<td>
  <span class="badge">${item.role}</span>
</td>
<td>
  <select class="input role-select" data-user-id="${item.id}">
    <option value="user" ${item.role === 'user' ? 'selected' : ''}>user</option>
    <option value="teacher" ${item.role === 'teacher' ? 'selected' : ''}>teacher</option>
    <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>admin</option>
  </select>
</td>
<td>${new Date(item.created_at).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h2>Последние результаты</h2>

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
                        <th>Уничтожено</th>
                        <th>Урон</th>
                        <th>Время</th>
                        <th>Прав. блок.</th>
<th>Ложн.</th>
<th>Точность</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${results.slice(0, 20).map(item => `
                        <tr>
                          <td>${item.id}</td>
                          <td>${item.user_id}</td>
                          <td>${item.level_id}</td>
                          <td>${item.score}</td>
                          <td>${item.enemies_destroyed}</td>
                          <td>${item.damage_taken}</td>
                          <td>${item.time_spent} сек.</td>
                          <td>${item.correct_blocks ?? 0}</td>
<td>${item.false_positives ?? 0}</td>
<td>${item.accuracy ?? 0}%</td>

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

    document.querySelector<HTMLButtonElement>('#createLevelButton')!.addEventListener('click', () => {
        navigate('create-level');
    });

    const exportResultsButton = document.querySelector<HTMLButtonElement>('#exportResultsButton');

if (exportResultsButton) {
  exportResultsButton.addEventListener('click', () => {
    exportResultsToCsv(results as unknown as Array<Record<string, unknown>>);
  });
}

    document.querySelector<HTMLButtonElement>('#createTopicButton')!.addEventListener('click', () => {
        navigate('create-topic');
    });

        document.querySelectorAll<HTMLButtonElement>('[data-edit-level-id]').forEach(button => {
        button.addEventListener('click', () => {
        const levelId = Number(button.dataset.editLevelId);
        navigate('edit-level', { levelId });
      });
    });

    document.querySelectorAll<HTMLButtonElement>('[data-delete-level-id]').forEach(button => {
      button.addEventListener('click', async () => {
        const levelId = Number(button.dataset.deleteLevelId);

        const confirmed = confirm('Отключить этот уровень? Он пропадёт из списка доступных уровней.');

        if (!confirmed) {
          return;
        }

        try {
          await deleteLevel(levelId);
          renderAdminPage(app);
        } catch (error) {
          alert((error as Error).message);
        }
      });
    });

        document.querySelectorAll<HTMLButtonElement>('[data-edit-topic-id]').forEach(button => {
      button.addEventListener('click', () => {
        const topicId = Number(button.dataset.editTopicId);
        navigate('edit-topic', { topicId });
      });
    });

    document.querySelectorAll<HTMLButtonElement>('[data-delete-topic-id]').forEach(button => {
      button.addEventListener('click', async () => {
        const topicId = Number(button.dataset.deleteTopicId);

        const confirmed = confirm('Отключить эту учебную тему? Она пропадёт из раздела обучения.');

        if (!confirmed) {
          return;
        }

        try {
          await deleteTopic(topicId);
          renderAdminPage(app);
        } catch (error) {
          alert((error as Error).message);
        }
      });
    });
document.querySelectorAll<HTMLSelectElement>('.role-select').forEach(select => {
  select.addEventListener('change', async () => {
    const userId = Number(select.dataset.userId);
    const newRole = select.value;

    const confirmed = confirm(`Изменить роль пользователя на "${newRole}"?`);

    if (!confirmed) {
      renderAdminPage(app);
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      renderAdminPage(app);
    } catch (error) {
      alert((error as Error).message);
      renderAdminPage(app);
    }
  });
});
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки админ-панели</h1>
          <p class="error">${(error as Error).message}</p>
          <button class="button" id="backButton">Назад</button>
        </div>
      </div>
    `;

    document.querySelector<HTMLDivElement>('.brand')?.addEventListener('click', () => {
  navigate('levels');
});
document.querySelectorAll<HTMLSelectElement>('.role-select').forEach(select => {
  select.addEventListener('change', async () => {
    const userId = Number(select.dataset.userId);
    const newRole = select.value;

    const confirmed = confirm(`Изменить роль пользователя на "${newRole}"?`);

    if (!confirmed) {
      renderAdminPage(app);
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      renderAdminPage(app);
    } catch (error) {
      alert((error as Error).message);
      renderAdminPage(app);
    }
  });
});
    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('levels');
    });

  }
}

function exportResultsToCsv(results: Array<Record<string, unknown>>): void {
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
  link.download = 'results_export.csv';
  link.click();

  URL.revokeObjectURL(url);
}