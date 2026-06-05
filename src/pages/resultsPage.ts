import { getLevels, getMyResults } from '../api/client';
import { navigate } from '../main';

export async function renderResultsPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>История результатов</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
    const [results, levels] = await Promise.all([
      getMyResults(),
      getLevels(),
    ]);

    const levelMap = new Map(
      levels.map(level => [level.id, level.title])
    );

    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>История результатов</h1>
          <p>Здесь отображаются сохранённые прохождения игровых уровней.</p>

          <button class="button secondary" id="backButton">Назад к уровням</button>
        </div>

        <div class="card">
          ${
            results.length === 0
              ? '<p>Пока нет сохранённых результатов. Пройди уровень, чтобы результат появился здесь.</p>'
              : `
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Уровень</th>
                        <th>Статус</th>
                        <th>Очки</th>
                        <th>Уничтожено</th>
                        <th>Урон</th>
                        <th>Время</th>
                        <th>Правильные блокировки</th>
                        <th>Нормальный трафик</th>
                        <th>Ложные срабатывания</th>
                        <th>Точность</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${results.map(result => `
                        <tr>
                          <td>${result.id}</td>
                          <td>${levelMap.get(result.level_id) || `Уровень #${result.level_id}`}</td>
                          <td>
                            ${result.completed === 1 ? 'Пройден' : 'Не пройден'}
                          </td>
                          <td>${result.score}</td>
                          <td>${result.enemies_destroyed}</td>
                          <td>${result.correct_blocks ?? 0}</td>
                          <td>${result.allowed_normal_traffic ?? 0}</td>
                          <td>${result.false_positives ?? 0}</td>
                          <td>${result.accuracy ?? 0}%</td>
                          <td>${result.damage_taken}</td>
                          <td>${result.time_spent} сек.</td>
                          
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
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки результатов</h1>
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