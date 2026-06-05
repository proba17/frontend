import { getTopic, updateTopic } from '../api/client';
import { navigate } from '../main';
import type { TopicUpdate } from '../types';

export async function renderEditTopicPage(
  app: HTMLDivElement,
  topicId: number
): Promise<void> {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Редактирование темы</h1>
        <p>Загрузка...</p>
      </div>
    </div>
  `;

  try {
    const topic = await getTopic(topicId);

    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Редактирование темы #${topic.id}</h1>
          <p>Здесь можно изменить учебный материал.</p>

          <button class="button secondary" id="backButton">Назад в админ-панель</button>
        </div>

        <div class="card">
          <label>Название темы</label>
          <input class="input" id="title" value="${topic.title}" />

          <label>Краткое описание</label>
          <input class="input" id="shortDescription" value="${topic.short_description || ''}" />

          <label>Категория</label>
          <select class="input" id="category">
            <option value="Основы сетей" ${topic.category === 'Основы сетей' ? 'selected' : ''}>Основы сетей</option>
            <option value="Протоколы" ${topic.category === 'Протоколы' ? 'selected' : ''}>Протоколы</option>
            <option value="Атаки" ${topic.category === 'Атаки' ? 'selected' : ''}>Атаки</option>
            <option value="Защита" ${topic.category === 'Защита' ? 'selected' : ''}>Защита</option>
          </select>

          <label>Порядковый номер</label>
          <input class="input" id="orderNumber" type="number" value="${topic.order_number}" />

          <label>Содержание</label>
          <textarea class="input textarea" id="content">${topic.content}</textarea>

          <button class="button" id="saveButton">Сохранить изменения</button>

          <div id="message"></div>
        </div>
      </div>
    `;

    document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
      navigate('admin');
    });

    document.querySelector<HTMLButtonElement>('#saveButton')!.addEventListener('click', async () => {
      const title = document.querySelector<HTMLInputElement>('#title')!.value;
      const shortDescription = document.querySelector<HTMLInputElement>('#shortDescription')!.value;
      const category = document.querySelector<HTMLSelectElement>('#category')!.value;
      const orderNumber = Number(document.querySelector<HTMLInputElement>('#orderNumber')!.value);
      const content = document.querySelector<HTMLTextAreaElement>('#content')!.value;
      const message = document.querySelector<HTMLDivElement>('#message')!;

      if (!title.trim()) {
        message.innerHTML = `<p class="error">Введите название темы.</p>`;
        return;
      }

      if (!content.trim()) {
        message.innerHTML = `<p class="error">Введите содержание темы.</p>`;
        return;
      }

      const updateData: TopicUpdate = {
        title,
        short_description: shortDescription || null,
        category: category || null,
        order_number: orderNumber,
        content,
      };

      try {
        await updateTopic(topic.id, updateData);

        message.innerHTML = `<p class="success">Изменения сохранены.</p>`;
      } catch (error) {
        message.innerHTML = `<p class="error">${(error as Error).message}</p>`;
      }
    });
  } catch (error) {
    app.innerHTML = `
      <div class="app">
        <div class="card">
          <h1>Ошибка загрузки темы</h1>
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