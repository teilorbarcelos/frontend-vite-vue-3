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
      // Placeholder directories
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/components/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/constants/.gitkeep',
        template: ''
      }
    ]
  });
}
