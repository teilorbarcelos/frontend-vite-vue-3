export default function (plop) {
  plop.setGenerator('feature', {
    description: 'Create a new feature (Service + Page + Tests)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (e.g. customer, category):'
      }
    ],
    actions: [
      // Service
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/services/{{kebabCase name}}.service.ts',
        templateFile: 'generators/templates/feature/service.ts.hbs'
      },
      // Service Test
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/services/__tests__/{{kebabCase name}}.service.test.ts',
        templateFile: 'generators/templates/feature/service.test.ts.hbs'
      },
      // List Page
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/pages/{{pascalCase name}}ListPage.vue',
        templateFile: 'generators/templates/feature/list-page.vue.hbs'
      },
      // List Page Test
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/pages/__tests__/{{pascalCase name}}ListPage.test.tsx',
        templateFile: 'generators/templates/feature/list-page.test.tsx.hbs'
      },
      // Form Page
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/pages/{{pascalCase name}}FormPage.vue',
        templateFile: 'generators/templates/feature/form-page.vue.hbs'
      },
      // Form Page Test
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/pages/__tests__/{{pascalCase name}}FormPage.test.tsx',
        templateFile: 'generators/templates/feature/form-page.test.tsx.hbs'
      },
      // Constants
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/constants/{{kebabCase name}}.constants.ts',
        templateFile: 'generators/templates/feature/constants.ts.hbs'
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/constants/{{camelCase name}}HeaderMap.ts',
        templateFile: 'generators/templates/feature/header-map.ts.hbs'
      },
      // Filters Component
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/components/{{pascalCase name}}Filters.vue',
        templateFile: 'generators/templates/feature/filters.vue.hbs'
      },
      // Filters Test
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/components/__tests__/{{pascalCase name}}Filters.test.tsx',
        templateFile: 'generators/templates/feature/filters.test.tsx.hbs'
      },
      // Routes
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
        templateFile: 'generators/templates/feature/routes.ts.hbs'
      },
      // Menu
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/{{kebabCase name}}.menu.ts',
        templateFile: 'generators/templates/feature/menu.ts.hbs'
      },
      // Router Registration - Import
      {
        type: 'modify',
        path: 'src/router/index.ts',
        pattern: /(\/\/ \[PLOP_IMPORT_MARKER\])/g,
        template: `import { {{camelCase name}}Routes } from '@/features/{{kebabCase name}}/{{kebabCase name}}.routes';
$1`
      },
      // Router Registration - Export
      {
        type: 'modify',
        path: 'src/router/index.ts',
        pattern: /(,?)\s*(\/\/ \[PLOP_ROUTE_MARKER\])/g,
        template: `,
      ...{{camelCase name}}Routes,
      $2`
      },
      // Menu Registration - Import
      {
        type: 'modify',
        path: 'src/router/navItems.ts',
        pattern: /(\/\/ \[PLOP_IMPORT_MARKER\])/g,
        template: `import { {{camelCase name}}Menu } from '@/features/{{kebabCase name}}/{{kebabCase name}}.menu';
$1`
      },
      // Menu Registration - Export
      {
        type: 'modify',
        path: 'src/router/navItems.ts',
        pattern: /(,?)\s*(\/\/ \[PLOP_MENU_MARKER\])/g,
        template: `,
  {{camelCase name}}Menu,
  $2`
      }
    ]
  });
}
