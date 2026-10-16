import { greet } from './greet';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app root missing');

app.innerHTML = `
  <h1>${import.meta.env.VITE_APP_TITLE ?? 'Template project'}</h1>
  <label>Name <input id="name" autocomplete="off" /></label>
  <p id="greeting" role="status">${greet('')}</p>
`;

const input = app.querySelector<HTMLInputElement>('#name');
const output = app.querySelector<HTMLElement>('#greeting');
input?.addEventListener('input', () => {
  if (output) output.textContent = greet(input.value);
});
