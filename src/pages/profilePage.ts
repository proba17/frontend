import {
  checkAchievements,
  getMe,
  getMyAchievementsFull,
  getMyStatistics,
  refreshToken,
  deleteMyAccount,
    getFinalTestStatistics

} from '../api/client';
import { navigate } from '../main';

export async function renderProfilePage(app: HTMLDivElement): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Профиль</h1>
        <p>Загрузка данных пользователя...</p>
      </div>
    </div>
  `;

  try {
    await refreshToken();
    await checkAchievements();

    const [user, statistics, achievements, finalTest] = await Promise.all([
      getMe(),
      getMyStatistics(),
      getMyAchievementsFull(),
      getFinalTestStatistics()
    ]);

    const achievementsHtml =
  achievements.length === 0
    ? `
      <p>Пока достижений нет. Пройди первый уровень, чтобы получить награду.</p>
    `
    : `
      <div class="grid">
        ${achievements
          .map(
            item => `
              <div class="mini-card achievement-card">
                <div class="achievement-icon">
                  ${getAchievementIcon(item.icon)}
                </div>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <div class="badge">${item.condition_type}</div>
                <p>Получено: ${new Date(item.earned_at).toLocaleString()}</p>
              </div>
            `
          )
          .join('')}
      </div>
    `;

    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Профиль пользователя</h1>
          <p><b>Логин:</b> ${user.username}</p>
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Роль:</b> ${user.role}</p>

          <button class="button secondary" id="backButton">Назад к уровням</button>
          <button class="button danger" id="deleteAccountButton">Удалить аккаунт</button>
        </div>

        <div class="card">
          <h2>Статистика прохождения</h2>

          <div class="stats-grid">
            <div class="stat-card">
              <span>Пройдено уровней</span>
              <b>${statistics.levels_completed}</b>
            </div>

            <div class="stat-card">
              <span>Общий счёт</span>
              <b>${statistics.total_score}</b>
            </div>

            <div class="stat-card">
              <span>Лучший результат</span>
              <b>${statistics.best_score}</b>
            </div>

            <div class="stat-card">
              <span>Уничтожено пакетов</span>
              <b>${statistics.total_enemies_destroyed}</b>
            </div>

            <div class="stat-card">
              <span>Получено урона</span>
              <b>${statistics.total_damage_taken}</b>
            </div>

            <div class="stat-card">
              <span>Время в игре</span>
              <b>${statistics.total_time_spent} сек.</b>
            </div>

            <div class="stat-card">
  <span>Средняя точность</span>
  <b>${statistics.average_accuracy || 0}%</b>
</div>

<div class="stat-card">
  <span>Правильные блокировки</span>
  <b>${statistics.total_correct_blocks || 0}</b>
</div>

<div class="stat-card">
  <span>Разрешён нормальный трафик</span>
  <b>${statistics.total_allowed_normal_traffic || 0}</b>
</div>

<div class="stat-card">
  <span>Ложные срабатывания</span>
  <b>${statistics.total_false_positives || 0}</b>
</div>
          </div>
        </div>

        <div class="card">

  <h2>🏆 Итоговая аттестация</h2>

  <div class="stats-grid">

    <div class="stat-card">
      <span>Попыток</span>
      <b>${finalTest.attempts}</b>
    </div>

    <div class="stat-card">
      <span>Лучший результат</span>
      <b>${finalTest.best_score}%</b>
    </div>

    <div class="stat-card">
      <span>Средний результат</span>
      <b>${finalTest.average_score}%</b>
    </div>

    <div class="stat-card">
      <span>Последний результат</span>
      <b>${finalTest.last_score}%</b>
    </div>

  </div>

  <div
    style="
      margin-top:20px;
      text-align:center;
      font-size:22px;
      font-weight:bold;
    "
  >
    
  

</div>

        <div class="card">
  <h2>Рекомендации по обучению</h2>
  ${getLearningRecommendations(statistics)}
</div>

        <div class="card">
          <h2>Достижения</h2>
          ${achievementsHtml}
        </div>
      </div>
    `;
 

    document.querySelector<HTMLButtonElement>('#deleteAccountButton')?.addEventListener('click', async () => {
  const firstConfirm = confirm(
    'Вы действительно хотите удалить аккаунт? Все ваши результаты будут удалены.'
  );

  if (!firstConfirm) {
    return;
  }

  const secondConfirm = confirm(
    'Это действие нельзя отменить. Удалить аккаунт окончательно?'
  );

  if (!secondConfirm) {
    return;
  }

  try {
    await deleteMyAccount();

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    alert('Аккаунт удалён.');

    navigate('login');
  } catch (error) {
    alert((error as Error).message);
  }
});

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('levels');
    });
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки профиля</h1>
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

function getAchievementIcon(icon: string | null): string {
  if (icon === 'first_step') {
    return '🚀';
  }

  if (icon === 'level_complete') {
    return '✅';
  }

  if (icon === 'score_800') {
    return '⭐';
  }

  if (icon === 'score_1000') {
    return '🏆';
  }

  if (icon === 'low_damage') {
    return '🛡️';
  }

  if (icon === 'destroy_50') {
    return '⚡';
  }

  if (icon === 'complete_3') {
    return '🎯';
  }

  if (icon === 'destroy_100') {
    return '🔥';
  }

  return '🏅';
}

function getLearningRecommendations(statistics: {
  average_accuracy?: number;
  total_false_positives?: number;
  total_damage_taken?: number;
  completed_levels?: number;
  total_correct_blocks?: number;
  total_allowed_normal_traffic?: number;
}): string {
  const recommendations: string[] = [];

  const hasAnyGameData =
    (statistics.completed_levels || 0) > 0 ||
    (statistics.total_correct_blocks || 0) > 0 ||
    (statistics.total_allowed_normal_traffic || 0) > 0 ||
    (statistics.total_false_positives || 0) > 0 ||
    (statistics.total_damage_taken || 0) > 0;

  if (!hasAnyGameData) {
    recommendations.push(
      'Пройдите первый уровень, чтобы система могла оценить ваши навыки фильтрации трафика.'
    );
  } else {
    if ((statistics.average_accuracy || 0) < 70) {
      recommendations.push(
        'Рекомендуется повторить темы по анализу сетевых пакетов, протоколам TCP/UDP/ICMP и признакам подозрительного трафика.'
      );
    }

    if ((statistics.total_false_positives || 0) > 0) {
      recommendations.push(
        'Обратите внимание на ложные срабатывания: обычный трафик не нужно блокировать. Повторите темы Firewall, ACL и IDS.'
      );
    }

    if ((statistics.total_damage_taken || 0) > 30) {
      recommendations.push(
        'Сервер часто получает урон. Рекомендуется повторить темы ICMP Flood, UDP Flood, SYN Flood и способы защиты от них.'
      );
    }

    if ((statistics.average_accuracy || 0) >= 85) {
      recommendations.push(
        'Хороший результат: вы достаточно точно отличаете нормальный трафик от вредоносного. Можно переходить к экспертным уровням.'
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Результаты стабильные. Продолжайте проходить уровни, чтобы улучшить точность и скорость реакции.'
    );
  }

  return `
    <div class="grid">
      ${recommendations.map(item => `
        <div class="mini-card">
          <h3>Рекомендация</h3>
          <p>${item}</p>
        </div>
      `).join('')}
    </div>
  `;
}