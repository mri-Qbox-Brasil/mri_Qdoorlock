module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/exec', {
      // set-version injeta a versao no placeholder __VERSION__ do
      // fxmanifest (nao commitado de volta) e bumpa web/package.json.
      // build empacota o resource buildado em dist/<name>.zip e cria a
      // arvore dist/<name>/ (sem fonte da UI) usada no sync publico.
      prepareCmd: "npx workflows set-version ${nextRelease.version} \"$WEB_PATH\" && npx workflows build \"$RESOURCE_NAME\" \"$WEB_PATH\"",
      // Escreve versao e notas para as etapas de sync/release publico.
      successCmd: "echo \"${nextRelease.version}\" > .VERSION && cat > .NOTES.md << '___RELEASE_NOTES_EOF___'\n${nextRelease.notes}\n___RELEASE_NOTES_EOF___"
    }],
    // Commita de volta apenas o bump do package.json do front e o
    // CHANGELOG. NUNCA inclui fxmanifest.lua: o source mantem __VERSION__.
    ['@semantic-release/git', {
      assets: [(process.env.WEB_PATH || 'web') + '/package.json', 'CHANGELOG.md'],
      message: 'chore(release): ${nextRelease.version} [skip ci]'
    }]
  ]
};
