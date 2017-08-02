angular.module('starter.controllers', [])

.controller('LuminosityCtrl',['$scope','$rootScope','$ionicPlatform','$cordovaSQLite','$interval','$cordovaDeviceMotion', function($scope,$rootScope,$ionicPlatform,$cordovaSQLite,$interval,$cordovaDeviceMotion) {
  $rootScope.current_metric = 900;
  $rootScope.multiplier = 1;


  
$scope.d_chart = [['Time', 'Value']];
 function onSuccess(values) {
   
        $rootScope.current_lux_metric = ($rootScope.multiplier*values[0]).toFixed(2);
                

        if($scope.d_chart.length<60){
          $scope.d_chart.push([$scope.d_chart.length,parseInt($rootScope.multiplier*values[0])]);
        }else{

           var i = 1;
           var length = $scope.d_chart.length;

           while(i<$scope.d_chart.length-1){
            $scope.d_chart[i]=[i,$scope.d_chart[i+1][1]];
            i++;
          }
          $scope.d_chart[$scope.d_chart.length-1] = [$scope.d_chart.length,parseInt($rootScope.multiplier*values[0])];
        }
        
        $scope.drawChart();
  };




$scope.load = function() {

        // Execute SELECT statement to load message from database.
        $cordovaSQLite.execute(db, 'SELECT * FROM Settings WHERE name="calibration_luminosity"')
            .then(
                function(res) {

                    if (res.rows.length > 0) {
                        $rootScope.multiplier        = res.rows.item(0).the_value;
                    }
                    else{
                      $rootScope.multiplier = 1;
                    }

                },
                function(error) {
                    $scope.statusMessage = "Error on loading: " + error.message;
                }
            );
}

ionic.Platform.ready(function(){
      
       
    $scope.load();
    
    sensors.enableSensor("LIGHT");
      /*sensors.enableSensor("AMBIENT_TEMPERATURE");*/
      /*sensors.enableSensor("TEMPERATURE");*/
      /*sensors.enableSensor("PRESSURE");*/
      /*sensors.enableSensor("RELATIVE_HUMIDITY");*/
    
      $interval(function(){    
        sensors.getState(onSuccess);

      }, 100);

});

$scope.d_chart = [
          ['Time', 'Value'],
          [1,  50],
          [2,  70],
          [3,  40],
          [4,  39],
          [5,  38],
          [6,  37],
          [7,  36],
          [8,  31],
          [9,  30],
          [10, 40],
          [11, 44],
          [12, 48],
          [13, 48],
          [14, 48],
          [15, 48],
          [16, 48],
          [17, 48],
          [18, 48],
          [19, 48],
          [20, 48],
          [21, 48],
          [22, 48],
          [23, 48]
        ];




$scope.drawChart = function(){
  

        var data = google.visualization.arrayToDataTable($scope.d_chart);

        var options = {
          hAxis: {
            textPosition: 'none',
            gridlines: {
                color: 'transparent'
              }
            },
          vAxis: {
              minValue: 0,
              textPosition: 'none', 
              gridlines: {
                color: 'transparent'
              }
          },
          legend: 'none',
           series: {
            0: { color: '#e2431e' }
          },
          chartArea: {
            left: 0,
            top: 0,
            bottom:0,
            width: '100%',
            height: '30%'
          }
        };

        var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      
}


$scope.getLineGraph = function(){
   
    google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback($scope.drawChart);     

  }

$scope.getLineGraph();
  
}])

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl',function($scope,$rootScope, $ionicModal,$window, $cordovaSQLite) {
  


  $scope.cal_value = 50;
  $scope.settings = {
    calibration_value: $scope.cal_value
  };









$scope.estimateNewMetric = function(){
  $scope.new_metric = parseInt($rootScope.multiplier*$rootScope.current_lux_metric);
}

$scope.multiplier_change = function(){
  $rootScope.multiplier = ($scope.settings.calibration_value/100)*2;
  $scope.estimateNewMetric();  
}


 $scope.load = function() {

        // Execute SELECT statement to load message from database.
        $cordovaSQLite.execute(db, 'SELECT * FROM Settings WHERE name="calibration_luminosity"')
            .then(
                function(res) {

                    if (res.rows.length > 0) {
                      $rootScope.multiplier        = res.rows.item(0).the_value;
                      $scope.settings.calibration_value = $rootScope.multiplier*50;
                      $scope.estimateNewMetric();
                      $scope.current_metric_id = res.rows.item(0).id;
                    }
                    else{
                      
                      $scope.current_metric_id = 0;
                    }
                },
                function(error) {
                    $scope.statusMessage = "Error on loading: " + error.message;
                }
            );
}
$scope.load();


$scope.saveCalibrationLuminosity = function(){
  
    if($scope.current_metric_id == 0){
          
          $cordovaSQLite.execute(db, 'INSERT INTO Settings (name,the_value) VALUES (?,?)', ['calibration_luminosity',$rootScope.multiplier])
            .then(function(result) {
                $scope.statusMessage = "Message saved successful, cheers!";
            }, function(error) {
                $scope.statusMessage = "Error on saving: " + error.message;
            })
    }else{

        $cordovaSQLite.execute(db, 'UPDATE Settings SET the_value=? WHERE name="calibration_luminosity"', [$rootScope.multiplier])
            .then(function(result) {
                $scope.statusMessage = "Message updated successful, cheers!";
            }, function(error) {
                $scope.statusMessage = "Error on saving: " + error.message;
            })

          }
      


}

$ionicModal.fromTemplateUrl('calibrate_luminosity.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.calibrate_luminosity = modal;
  });
  $scope.openModal = function(name) {
    if(name == 'luminosity'){

      $scope.calibrate_luminosity.show();
      $scope.select();
    }
  };
  $scope.closeModal = function(name) {
    if(name=='luminosity')
    $scope.calibrate_luminosity.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  /*$scope.settings = {
    enableFriends: true
  };*/
});
