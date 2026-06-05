import { createTopic } from '../api/client';
import { navigate } from '../main';
import type { TopicCreate } from '../types';

export function renderCreateTopicPage(app: HTMLDivElement): void {
  app.innerHTML = `
    <div class="app">
      <div class="card">
        <h1>Создание учебной темы</h1>
        <p>Здесь администратор может добавить новый обучающий материал.</p>

        <button class="button secondary" id="backButton">Назад в админ-панель</button>
      </div>

      <div class="card">
        <label>Название темы</label>
        <input class="input" id="title" placeholder="Например: IP Spoofing" />

        <label>Краткое описание</label>
        <input class="input" id="shortDescription" placeholder="Краткое описание темы" />

        <label>Категория</label>
        <select class="input" id="category">
          <option value="Основы сетей">Основы сетей</option>
          <option value="Протоколы">Протоколы</option>
          <option value="Атаки">Атаки</option>
          <option value="Защита">Защита</option>
        </select>

        <label>Порядковый номер</label>
        <input class="input" id="orderNumber" type="number" value="1" />

        <label>Содержание</label>
        <textarea class="input textarea" id="content" placeholder="Введите учебный материал"></textarea>

        <button class="button" id="createButton">Создать тему</button>

        <div id="message"></div>
      </div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
    navigate('admin');
  });

  document.querySelector<HTMLButtonElement>('#createButton')!.addEventListener('click', async () => {
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

    const topicData: TopicCreate = {
      title,
      short_description: shortDescription || null,
      content,
      category: category || null,
      order_number: orderNumber,
    };

    try {
      const createdTopic = await createTopic(topicData);

      message.innerHTML = `
        <p class="success">
          Тема создана. ID: ${createdTopic.id}
        </p>
      `;
    } catch (error) {
      message.innerHTML = `<p class="error">${(error as Error).message}</p>`;
    }
  });
}