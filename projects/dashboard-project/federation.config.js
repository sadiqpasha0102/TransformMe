const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'dashboard-project',

  exposes: {
    './Component': './projects/dashboard-project/src/app/app.component.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'ag-charts-community',
    'ag-grid-community',
    'ag-charts-angular',
    'ag-grid-angular'
  ]

});
