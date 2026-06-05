import { registerUser } from '../api/client';
import { navigate } from '../main';

export function renderRegisterPage(app: HTMLDivElement): void {
  app.innerHTML = `
  <div class="app">
    <div class="card hero">
      <div>
        <div class="hero-kicker">🚀 Новый пользователь</div>
        <h1 class="glow-text">Регистрация</h1>
        <p>Создай учётную запись, чтобы сохранять результаты, статистику и достижения.</p>

        <input class="input" id="username" placeholder="Логин" />
        <input class="input" id="email" placeholder="Email" />
        <input class="input" id="password" type="password" placeholder="Пароль" />

        <button class="button" id="registerButton">Зарегистрироваться</button>
        <button class="button secondary" id="backButton">Назад</button>

        <div id="message"></div>
      </div>

      <div class="hero-panel">
        <div class="hero-line"></div>
        <div class="hero-node"></div>
        <div class="hero-node"></div>
        <div class="hero-node"></div>
      </div>
    </div>
  </div>
`;

  const usernameInput = document.querySelector<HTMLInputElement>('#username')!;
  const emailInput = document.querySelector<HTMLInputElement>('#email')!;
  const passwordInput = document.querySelector<HTMLInputElement>('#password')!;
  const message = document.querySelector<HTMLDivElement>('#message')!;

  document.querySelector<HTMLButtonElement>('#registerButton')!.addEventListener('click', async () => {
    try {
      message.innerHTML = '';

      await registerUser(
        usernameInput.value,
        emailInput.value,
        passwordInput.value
      );

      message.innerHTML = `<p class="success">Пользователь создан. Теперь можно войти.</p>`;
    } catch (error) {
      message.innerHTML = `<p class="error">${(error as Error).message}</p>`;
    }
  });

  document.querySelector<HTMLButtonElement>('#backButton')!.addEventListener('click', () => {
    navigate('login');
  });
}