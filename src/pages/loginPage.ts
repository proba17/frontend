import { loginUser } from '../api/client';
import { navigate } from '../main';

export function renderLoginPage(app: HTMLDivElement): void {
  app.innerHTML = `
  <div class="app">
    <div class="card hero">
      <div>
        <div class="hero-kicker">🔐 Вход в систему</div>
        <h1 class="glow-text">Cyber Defense TD</h1>
        <p>
          Обучающая игра, где сетевые пакеты становятся игровыми объектами,
          а защитные модули помогают изучать основы кибербезопасности.
        </p>

        <input class="input" id="username" placeholder="Логин" />
        <input class="input" id="password" type="password" placeholder="Пароль" />

        <button class="button" id="loginButton">Войти</button>
        <button class="button secondary" id="registerButton">Регистрация</button>

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
  const passwordInput = document.querySelector<HTMLInputElement>('#password')!;
  const message = document.querySelector<HTMLDivElement>('#message')!;

  document.querySelector<HTMLButtonElement>('#loginButton')!.addEventListener('click', async () => {
    try {
      message.innerHTML = '';

      await loginUser(usernameInput.value, passwordInput.value);

      navigate('levels');
    } catch (error) {
      message.innerHTML = `<p class="error">${(error as Error).message}</p>`;
    }
  });

  document.querySelector<HTMLButtonElement>('#registerButton')!.addEventListener('click', () => {
    navigate('register');
  });
}