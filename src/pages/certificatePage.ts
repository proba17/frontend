import {
  getMe,
  getFinalTestStatistics,
  downloadCertificate
} from '../api/client';

import { navigate } from '../main';

export async function renderCertificatePage(
  app: HTMLDivElement
): Promise<void> {

  const [user, stats] =
    await Promise.all([
      getMe(),
      getFinalTestStatistics()
    ]);

  app.innerHTML = `
    <div class="app">

      <div
        class="card"
        style="
          max-width:900px;
          margin:auto;
          text-align:center;
          padding:50px;
        "
      >

        <h1>
          🏆 СЕРТИФИКАТ
        </h1>

        <p>
          Подтверждается, что
        </p>

        <h2>
          ${user.username}
        </h2>

        <p>
          успешно завершил обучение
          по курсу
        </p>

        <h3>
          Основы сетевой безопасности
          и защиты компьютерных сетей
        </h3>

        <br>

        <p>
          Итоговый результат
        </p>

        <h2>
          ${stats.best_score}%
        </h2>

        <p>
          Квалификация
        </p>

        <h2>
          🎓 ${stats.certificate}
        </h2>

        
        <br>

        <button
  id="downloadButton"
  class="button"
>
  📄 Скачать PDF
</button>

        <button
          id="backButton"
          class="button"
        >
          Назад
        </button>

      </div>

    </div>
  `;

  document
  .querySelector('#downloadButton')
  ?.addEventListener(
    'click',
    async () => {
      await downloadCertificate();
    }
  );
  document
    .querySelector('#backButton')
    ?.addEventListener(
      'click',
      () => navigate('profile')
    );
}

