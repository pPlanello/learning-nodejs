module.exports = {
  default: {
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    require: ['tests/acceptance/step-definitions/**/*.ts'],
    paths: ['tests/acceptance/features/**/*.feature'],
    tags: 'not @pending',
  },
}
