export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'generated/**',
      '**/generated/**',
      '**/*.generated.*',
      '**/*.ts',
    ],
  },
  {
    files: ['**/*.js', '**/*.ts'],
    rules: {},
  },
];
