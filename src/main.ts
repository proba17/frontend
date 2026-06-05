import './style.css';

import { renderGamePage } from './game/gamePage';
import { renderLevelsPage } from './pages/levelsPage';
import { renderLoginPage } from './pages/loginPage';
import { renderRegisterPage } from './pages/registerPage';
import { renderTopicsPage } from './pages/topicsPage';
import { renderProfilePage } from './pages/profilePage';
import { renderAdminPage } from './pages/adminPage';
import { renderCreateLevelPage } from './pages/createLevelPage';
import { renderEditLevelPage } from './pages/editLevelPage';
import { renderCreateTopicPage } from './pages/createTopicPage';
import { renderEditTopicPage } from './pages/editTopicPage';
import { renderResultsPage } from './pages/resultsPage';
import { renderTeacherPage } from './pages/teacherPage';
import { renderAboutPage } from './pages/aboutPage';
import { renderLeaderboardPage } from './pages/leaderboardPage';
import { renderTestsPage } from './pages/testsPage';

const app = document.querySelector<HTMLDivElement>('#app')!;

document.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  const brand = target.closest('.brand');

  if (!brand) {
    return;
  }

  const isGameRunning = Boolean(document.querySelector('#gameCanvas'));

  if (isGameRunning) {
    const confirmed = confirm('Выйти из текущего уровня и вернуться на главную? Текущий прогресс уровня не сохранится.');

    if (!confirmed) {
      return;
    }
  }

  navigate('levels');
});
export function navigate(page: string, params: Record<string, unknown> = {}): void {

  const pagesToSave = [
  'levels',
  'topics',
  'profile',
  'results',
  'leaderboard',
  'teacher',
  'admin',
  'about',
];

if (pagesToSave.includes(page)) {
  localStorage.setItem('lastPage', page);
}

if (page === 'game') {
  localStorage.setItem('lastPage', 'levels');
}

    if (page === 'login') {
    renderLoginPage(app);
    return;
  }

  if (page === 'register') {
    renderRegisterPage(app);
    return;
  }

  if (page === 'topics') {
    renderTopicsPage(app);
    return;
  }

  if (page === 'tests') {
  renderTestsPage(app);
  return;
}

  if (page === 'profile') {
    renderProfilePage(app);
    return;
  }

  if (page === 'game') {
  renderGamePage(app, {
    levelId: Number(params?.levelId),
  });
  return;
}

  if (page === 'admin') {
    renderAdminPage(app);
    return;
  }

  if (page === 'create-level') {
    renderCreateLevelPage(app);
    return;
  }

  if (page === 'edit-level') {
    renderEditLevelPage(app, Number(params?.levelId));
    return;
  }

  if (page === 'create-topic') {
    renderCreateTopicPage(app);
    return;
  }

  if (page === 'edit-topic') {
    renderEditTopicPage(app, Number(params?.topicId));
    return;
  }

  if (page === 'results') {
    renderResultsPage(app);
    return;
  }

  if (page === 'leaderboard') {
  renderLeaderboardPage(app);
  return;
}

  if (page === 'teacher') {
  renderTeacherPage(app);
  return;
}

if (page === 'tests') {
  renderTestsPage(app);
  return;
}

if (page === 'about') {
  renderAboutPage(app);
  return;
}
  renderLevelsPage(app);
}



const token = localStorage.getItem('token');
const lastPage = localStorage.getItem('lastPage') || 'levels';

if (token) {
  navigate(lastPage);
} else {
  navigate('login');
}