import { criarApp } from './app.js';

const porta = Number(process.env.PORT ?? 3000);

criarApp().listen(porta, () => {
  console.log(`TechLog API em http://localhost:${porta}`);
  console.log(`Cliente em http://localhost:${porta}/`);
});
