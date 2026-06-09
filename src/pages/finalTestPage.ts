import { navigate } from '../main';

import {
  getFinalTestQuestions,
  submitFinalTest,
  getFinalTestDifficulty,
} from '../api/client';

export async function renderFinalTestPage(
  app: HTMLDivElement
): Promise<void> {

  const [
    questions,
    difficulty
  ] = await Promise.all([
    getFinalTestQuestions(),
    getFinalTestDifficulty()
  ]);

  let currentIndex = 0;

  const answers: {
    question_id: number;
    answer: string;
  }[] = new Array(questions.length);

  renderIntro();

  function renderIntro(): void {

    app.innerHTML = `
      <div class="app">

        <div class="card">

          <h1>Итоговое тестирование</h1>

          <p>
            Средняя точность прохождения уровней:
            <b>${difficulty.accuracy}%</b>
          </p>

          <p>
            Уровень подготовки:
            <b>${difficulty.level}</b>
          </p>

          <p>
            Для вас сформирован тест из
            <b>${difficulty.questions_count}</b>
            вопросов.
          </p>

          <button
            id="startTestButton"
            class="button"
          >
            Начать тестирование
          </button>

          <button
  id="menuButton"
  class="button secondary"
>
  Главное меню
</button>

        </div>

      </div>
    `;

    document
  .querySelector('#menuButton')
  ?.addEventListener(
    'click',
    () => {
      navigate('levels');
    }
  );
    document
      .querySelector('#startTestButton')
      ?.addEventListener('click', () => {
        renderQuestion();
      });
  }

  function renderQuestion(): void {

    const q = questions[currentIndex];

    const selectedAnswer =
      answers[currentIndex]?.answer ?? null;

    app.innerHTML = `
      <div class="app">

        <div class="card">

          <h1>Финальное тестирование</h1>

          <div style="margin-bottom:16px">

            <div
              style="
                height:10px;
                background:#1e293b;
                border-radius:10px;
                overflow:hidden;
              "
            >
              <div
                style="
                  height:100%;
                  width:${((currentIndex + 1) / questions.length) * 100}%;
                  background:#22c55e;
                "
              ></div>
            </div>

            <p>
              Вопрос ${currentIndex + 1}
              из ${questions.length}
            </p>

          </div>

          <h2>${q.question}</h2>

          <div class="grid">

            ${[
              ['a', q.option_a],
              ['b', q.option_b],
              ['c', q.option_c],
              ['d', q.option_d]
            ].map(([value, text]) => `
              <button
                class="button answer-btn ${
                  selectedAnswer === value
                    ? 'selected-answer'
                    : ''
                }"
                data-value="${value}"
              >
                ${text}
              </button>
            `).join('')}

          </div>

          <div
            style="
              margin-top:20px;
              display:flex;
              gap:10px;
            "
          >

          <button
  id="menuButton"
  class="button secondary"
>
  Главное меню
</button>

            <button
              id="prevButton"
              class="button secondary"
              ${currentIndex === 0 ? 'disabled' : ''}
            >
              ← Назад
            </button>

            <button
              id="nextButton"
              class="button"
            >
              ${
                currentIndex === questions.length - 1
                  ? 'Завершить тест'
                  : 'Далее →'
              }
            </button>

          </div>

        </div>

      </div>
    `;

    

    document
  .querySelector('#menuButton')
  ?.addEventListener(
    'click',
    () => {

      const leave =
        confirm(
          'Выйти из теста? Прогресс будет потерян.'
        );

      if (leave) {
        navigate('levels');
      }
    }
  );

    document
      .querySelectorAll('.answer-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            const answer =
              (
                button as HTMLButtonElement
              ).dataset.value || '';

            answers[currentIndex] = {
              question_id: q.id,
              answer
            };

            renderQuestion();
          }
        );
      });

    document
      .querySelector('#prevButton')
      ?.addEventListener(
        'click',
        () => {

          if (currentIndex > 0) {

            currentIndex--;

            renderQuestion();
          }
        }
      );

    document
      .querySelector('#nextButton')
      ?.addEventListener(
        'click',
        async () => {

          if (!answers[currentIndex]) {

            alert(
              'Выберите вариант ответа'
            );

            return;
          }

          if (
            currentIndex <
            questions.length - 1
          ) {

            currentIndex++;

            renderQuestion();

            return;
          }

          const result =
            await submitFinalTest({
              answers
            });

          renderResult(result);
        }
      );
  }

  function renderResult(
    result: any
  ): void {

    app.innerHTML = `
      <div class="app">

        <div class="card">

          <h1>Итоговый результат</h1>

          <h2>${result.score}%</h2>

          <p>
            Верно:
            ${result.correct_answers}
            из
            ${result.total_questions}
          </p>

          <p>
            ${
              result.passed
                ? '✅ Итоговая аттестация успешно пройдена'
                : '❌ Аттестация не пройдена'
            }
          </p>

          <p>
            ${
              result.score >= 90
                ? 'Квалификация: Эксперт сетевой защиты'
                : result.score >= 80
                  ? 'Квалификация: Инженер информационной безопасности'
                  : result.score >= 70
                    ? 'Квалификация: Аналитик SOC'
                    : 'Требуется дополнительное обучение'
            }
          </p>

         <div
  style="
    display:flex;
    gap:10px;
    justify-content:center;
    margin-top:20px;
  "
>

 

  <button
    id="menuButton"
    class="button secondary"
  >
    Главное меню
  </button>

</div>

        </div>

      </div>
    `;


document
  .querySelector('#menuButton')
  ?.addEventListener(
    'click',
    () => {
      navigate('home');
    }
  );

  document
  .querySelector('#menuButton')
  ?.addEventListener(
    'click',
    () => {
      navigate('levels');
    }
  );
  }
}

