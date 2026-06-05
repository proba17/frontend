import { getLevel, getTopics, updateLevel } from '../api/client';
import { navigate } from '../main';
import type { LevelCreate } from '../types';

export async function renderEditLevelPage(
  app: HTMLDivElement,
  levelId: number
): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Редактирование уровня</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
    const [level, topics] = await Promise.all([
      getLevel(levelId),
      getTopics(),
    ]);

    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Редактирование уровня #${level.id}</h1>
          <p>Здесь можно изменить основные параметры уровня.</p>

          <button class="button secondary" id="backButton">Назад в админ-панель</button>
        </div>

        <div class="card">
          <label>Название уровня</label>
          <input class="input" id="title" value="${level.title}" />

          <label>Описание</label>
          <input class="input" id="description" value="${level.description || ''}" />

          <label>Учебная тема</label>
          <select class="input" id="topicSelect">
            <option value="">Без темы</option>
            ${topics.map(topic => `
              <option value="${topic.id}" ${topic.id === level.topic_id ? 'selected' : ''}>
                ${topic.title}
              </option>
            `).join('')}
          </select>

          <label>Сложность</label>
          <select class="input" id="difficulty">
            <option value="easy" ${level.difficulty === 'easy' ? 'selected' : ''}>easy</option>
            <option value="medium" ${level.difficulty === 'medium' ? 'selected' : ''}>medium</option>
            <option value="hard" ${level.difficulty === 'hard' ? 'selected' : ''}>hard</option>
          </select>

          <label>Здоровье базы</label>
          <input class="input" id="baseHealth" type="number" value="${level.base_health}" />

          <label>Начальные ресурсы</label>
          <input class="input" id="startResources" type="number" value="${level.start_resources}" />

          <button class="button" id="saveButton">Сохранить изменения</button>

          <div id="message"></div>
        </div>

        <div class="card">
          <h2>Текущая игровая конфигурация</h2>
          <p>Пока редактируются только основные поля уровня. Конфигурация карты, волн и защитных модулей сохраняется без изменений.</p>

          <details>
            <summary>Показать JSON-конфигурацию</summary>
            <pre class="code-block">${JSON.stringify(
              {
                map_config: level.map_config,
                waves_config: level.waves_config,
                defense_config: level.defense_config,
              },
              null,
              2
            )}</pre>
          </details>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('admin');
    });

    document.querySelector<HTMLButtonElement>('#saveButton')!.addEventListener('click', async () => {
      const title = document.querySelector<HTMLInputElement>('#title')!.value;
      const description = document.querySelector<HTMLInputElement>('#description')!.value;
      const topicSelect = document.querySelector<HTMLSelectElement>('#topicSelect')!;
      const difficulty = document.querySelector<HTMLSelectElement>('#difficulty')!.value;
      const baseHealth = Number(document.querySelector<HTMLInputElement>('#baseHealth')!.value);
      const startResources = Number(document.querySelector<HTMLInputElement>('#startResources')!.value);
      const message = document.querySelector<HTMLDivElement>('#message')!;

      if (!title.trim()) {
        message.innerHTML = `<p class="error">Введите название уровня.</p>`;
        return;
      }

      const topicId = topicSelect.value ? Number(topicSelect.value) : null;
      const topicTitle = topicId
        ? topicSelect.options[topicSelect.selectedIndex].textContent?.trim() || null
        : null;

      const updateData: Partial<LevelCreate> = {
  title,
  description: description || null,
  topic: topicTitle,
  topic_id: topicId,
  campaign: level.campaign,
  order_number: level.order_number,
  difficulty,
  base_health: baseHealth,
  start_resources: startResources,
};

      try {
        await updateLevel(level.id, updateData);

        message.innerHTML = `
          <p class="success">Изменения сохранены.</p>
        `;
      } catch (error) {
        message.innerHTML = `<p class="error">${(error as Error).message}</p>`;
      }
    });
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки уровня</h1>
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