// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyC7sH3iPdi-jamDEZ7tz4zNyn-LA7mcD8c",
    authDomain: "appfoodtest.firebaseapp.com",
    databaseURL: "https://appfoodtest.firebaseio.com",
    projectId: "appfoodtest",
    storageBucket: "appfoodtest.appspot.com",
    messagingSenderId: "689700730693",
    appId: "1:689700730693:web:4255d7c557b9be85a6702c"
  },
  onesignal: {
    appId: '215dfea3-229c-4b81-847e-dfac8b57f756',
    googleProjectNumber: '781401911646',
    restKey: 'NWE0OWMzZGYtMWJiNS00MThlLTgyYWQtZWE5MzVlYjM4ZGI0'
  },
  stripe: {
    sk: 'sk_test_6FGt8mPIPTSXAKata4cMNw64'
  },
  general: {
    symbol: '$',
    code: 'USD'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
