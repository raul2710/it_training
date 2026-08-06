import { storage } from './storage.js';
import { homePage } from './pages/home.js';
import { lessonsPage } from './pages/lessons.js';
import { quizPage } from './pages/quiz.js';
import { resultPage } from './pages/result.js';

const HOME_HASH = '#/';

const routes = [
  { name: 'home', pattern: /^#\/?$/, view: homePage },
  { name: 'lessons', pattern: /^#\/lessons$/, view: lessonsPage },
  { name: 'quiz', pattern: /^#\/quiz\/([^/]+)$/, view: quizPage, params: ['lessonId'] },
  { name: 'result', pattern: /^#\/result$/, view: resultPage }
];

export const router = {
  params: {},
  cleanup: null,

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    if (!window.location.hash) {
      window.location.hash = HOME_HASH;
    }
    this.resolve();
  },

  navigate(path) {
    window.location.hash = path;
  },

  resolve() {
    const hash = window.location.hash || HOME_HASH;
    const app = document.getElementById('app');

    document.body.classList.remove('sidebar-open');

    if (typeof this.cleanup === 'function') {
      this.cleanup();
      this.cleanup = null;
    }

    const hasName = Boolean(storage.get('name'));
    if (!hasName && hash !== HOME_HASH) {
      this.navigate(HOME_HASH);
      return;
    }
    if (hasName && hash === HOME_HASH) {
      this.navigate('#/lessons');
      return;
    }

    const route = routes.find((r) => r.pattern.test(hash));
    if (!route) {
      this.navigate(HOME_HASH);
      return;
    }

    this.params = {};
    const match = hash.match(route.pattern);
    route.params?.forEach((key, index) => {
      this.params[key] = decodeURIComponent(match[index + 1]);
    });

    app.innerHTML = '';
    const result = route.view(this.params);

    if (result instanceof Node) {
      app.appendChild(result);
    } else {
      app.appendChild(result.el);
      this.cleanup = typeof result.onLeave === 'function' ? result.onLeave : null;
    }

    app.scrollTop = 0;
    window.scrollTo(0, 0);
  }
};