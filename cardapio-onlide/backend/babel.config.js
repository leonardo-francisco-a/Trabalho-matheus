module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '18'
        },
        modules: 'commonjs'
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ]
    }
  }
};