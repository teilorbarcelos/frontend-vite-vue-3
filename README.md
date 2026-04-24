# Frontend Vue 3 Boilerplate

Este é um boilerplate profissional para aplicações Vue 3, focado em escalabilidade, produtividade e qualidade de código. Ele utiliza uma arquitetura modular por funcionalidades (features) e possui uma política rígida de testes automatizados.

## 🚀 Tecnologias Utilizadas

- **Core**: [Vue 3](https://vuejs.org/) (Composition API com `<script setup>`)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estado Global**: [Pinia](https://pinia.vuejs.org/)
- **Server State**: [TanStack Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview)
- **Roteamento**: [Vue Router](https://router.vuejs.org/)
- **Formulários**: [VeeValidate](https://vee-validate.logaretm.com/v4/) + [Zod](https://zod.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/), [Radix Vue](https://www.radix-vue.com/), [Lucide Vue](https://lucide.dev/)
- **Testes**: [Vitest](https://vitest.dev/), [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/), [JSDOM](https://github.com/jsdom/jsdom)
- **Qualidade**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Husky](https://typicode.github.io/husky/), [Lint-staged](https://github.com/okonet/lint-staged)
- **Geradores**: [Plop](https://plopjs.com/)

## 📂 Estrutura de Pastas

A estrutura segue o padrão de **Feature-Based Architecture**, onde cada domínio de negócio possui sua própria pasta:

```text
src/
├── assets/          # Arquivos estáticos (imagens, fontes)
├── components/      # Componentes globais
│   └── ui/          # Componentes de UI base (Radix/Tailwind)
├── features/        # Módulos por funcionalidade (Ex: auth, product, user)
│   └── [feature]/
│       ├── components/  # Componentes específicos da feature
│       ├── pages/       # Páginas da feature
│       ├── services/    # Chamadas de API e lógica de negócio
│       ├── constants/   # Constantes locais
│       └── __tests__/   # Testes unitários e de integração
├── hooks/           # Composables globais
├── lib/             # Configurações de bibliotecas externas (Axios, Query Client)
├── router/          # Configuração de rotas
├── stores/          # Stores globais do Pinia
├── test/            # Setup de testes e mocks globais
└── utils/           # Funções utilitárias
```

## 🛠️ Utilização do Gerador

Para manter a consistência e acelerar o desenvolvimento, utilizamos o **Plop** para gerar novos módulos. O gerador cria automaticamente a estrutura de pastas, arquivos de serviço, páginas e os respectivos arquivos de teste.

Para criar uma nova funcionalidade, execute:

```bash
npm run generate
```

Siga as instruções no terminal para definir o nome do novo módulo.

## 🧪 Política de Testes

Este projeto mantém uma **cobertura rígida de 100%** para statements, branches, functions e lines. A configuração do Vitest está definida para falhar caso esses limites não sejam atingidos, garantindo a integridade do código em cada commit.

Para rodar os testes com coverage:

```bash
npm run test:coverage
```

### Exceções de Testes

Embora busquemos 100% de cobertura, alguns componentes de UI base que utilizam bibliotecas de terceiros (como **Radix Vue** ou **V-Calendar**) são tecnicamente impossíveis ou extremamente complexos de testar em ambiente **JSDOM** devido ao uso intensivo de Portals, calculo de posicionamento dinâmico (Popper.js) e interações complexas com o DOM que o JSDOM não simula perfeitamente.

Nestes casos, os componentes são excluídos da contagem de cobertura no `vite.config.ts`.

**Exemplos de exceções:**

1.  **SelectContent.vue**: Utiliza Portals do Radix Vue que renderizam o conteúdo fora da árvore principal do DOM simulada, dificultando a seleção de elementos nos testes.
2.  **Calendar.vue / RangeCalendar.vue**: Dependem da biblioteca `v-calendar`, que possui lógica interna complexa de renderização e datas que frequentemente causam inconsistências em testes unitários.
3.  **DateRangePicker.vue**: Um componente composto que utiliza múltiplos overlays e estados internos de bibliotecas externas, sendo mais adequado para testes de ponta-a-ponta (E2E) do que unitários.

> [!IMPORTANT]
> A exclusão de cobertura deve ser a **última opção** e aplicada apenas a componentes de UI base puramente visuais ou de terceiros. Toda a lógica de negócio (services, hooks, utils) e páginas de funcionalidades **devem** ter 100% de cobertura.

---

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera o build de produção com verificação de tipos.
- `npm run test`: Roda a suite de testes.
- `npm run test:coverage`: Roda os testes e gera o relatório de cobertura.
- `npm run generate`: Abre o gerador de módulos.
- `npm run lint`: Executa a verificação do linter.
- `npm run format`: Formata o código com Prettier.
