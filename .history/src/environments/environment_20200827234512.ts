// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCOUF4wCSkw-jJQQSfxwZ49PjGIxR9-EA4",
    authDomain: "ordo-1a3dc.firebaseapp.com",
    databaseURL: "https://ordo-1a3dc.firebaseio.com",
    projectId: "ordo-1a3dc",
    storageBucket: "ordo-1a3dc.appspot.com",
    messagingSenderId: "781401911646",
    appId: "1:781401911646:web:7e6fe6faa08c7b47d31fcf",
    measurementId: "G-L82WYBZCGC"
  },
  onesignal: {
    appId: '215dfea3-229c-4b81-847e-dfac8b57f756',
    googleProjectNumber: '781401911646',
    restKey: 'NWE0OWMzZGYtMWJiNS00MThlLTgyYWQtZWE5MzVlYjM4ZGI0'
  },
  stripe: {
    sk: 'sk_test_6FGt8mPIPTSXAKata4cMNw64'
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
