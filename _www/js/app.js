// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var db;
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    /*alert('device is ready');*/
  /*  db = $cordovaSQLite.openDB("gaia.db");
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS settings (id integer primary key, the_setting text, the_value text)");*/
    $ionicPlatform.ready(function () {
    
    try {
            db = $cordovaSQLite.openDB({name:"gaia.db",location:'default'});
        } catch (error) {
            /*alert(error);*/
        }
        
        $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT,the_value TEXT)');
 });
        
  });
})
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.luminosity', {
    url: '/luminosity',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-luminosity.html',
        controller: 'LuminosityCtrl'
      }
    }
  })

  .state('tab.thermometer', {
      url: '/thermometer',
      views: {
        'tab-thermometer': {
          templateUrl: 'templates/tab-thermometer.html',
          controller: 'ChatsCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/luminosity');

});
