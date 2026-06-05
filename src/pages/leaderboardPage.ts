import { getLeaderboard } from '../api/client';
import { navigate } from '../main';

export async function renderLeaderboardPage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Рейтинг пользователей</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
    const leaderboard = await getLeaderboard();

    app.innerHTML = `
      <div class="app">
        <div class="topbar">
          <div class="brand">
            <div class="brand-logo"></div>
            <div>
              <div class="brand-title">Рейтинг</div>
              <div class="brand-subtitle">Лучшие результаты пользователей</div>
            </div>
          </div>

          <div class="nav-actions">
            <button class="button secondary" id="backButton">Назад к уровням</button>
          </div>
        </div>

        <div class="card hero">
          <div>
            <div class="hero-kicker">🏆 Leaderboard</div>
            <h1 class="glow-text">Лучшие защитники сервера</h1>
            <p>
              Рейтинг формируется по лучшему счёту пользователя и средней точности классификации трафика.
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
          <h2>Таблица рейтинга</h2>

          ${
            leaderboard.length === 0
              ? `
                <div class="empty-state">
                  <h3>Рейтинг пока пуст</h3>
                  <p>Пройдите первый уровень, чтобы попасть в рейтинг.</p>
                </div>
              `
              : `
                <div class="table-wrapper">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Место</th>
                        <th>Пользователь</th>
                        <th>Лучший счёт</th>
                        <th>Средняя точность</th>
                        <th>Пройдено уровней</th>
                        <th>Прав. блокировки</th>
                        <th>Ложные срабатывания</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${leaderboard.map(item => `
                        <tr>
                          <td>${getPlaceIcon(item.place)} ${item.place}</td>
                          <td>${item.username}</td>
                          <td>${item.best_score}</td>
                          <td>${item.average_accuracy}%</td>
                          <td>${item.completed_levels}</td>
                          <td>${item.total_correct_blocks}</td>
                          <td>${item.total_false_positives}</td>
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
          <h1>Ошибка загрузки рейтинга</h1>
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

function getPlaceIcon(place: number): string {
  if (place === 1) {
    return '🥇';
  }

  if (place === 2) {
    return '🥈';
  }

  if (place === 3) {
    return '🥉';
  }

  return '🛡️';
}