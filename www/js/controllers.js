angular.module('starter.controllers', ['ngCordova'])
.controller('LoginCtrl',function($scope,$http,$rootScope,$state){
 

  $rootScope.auth_token = '7b5b648e-826a-4f0d-9736-9339bcfe4cb8';
  $rootScope.lum_measurement = 0;
  $scope.data = {};

  $scope.authenticate= function(){

            $scope.login_error = 0;
            if($scope.data.username!='' && $scope.data.password!=''){

              var aut = $http({
                    url: 'https://sso.sparkworks.net/aa/oauth/token?client_id=buildingmanager&client_secret=634c1f75-71d9-4362-8e7f-91b643722362&grant_type=password&username='+$scope.data.username+'&password='+$scope.data.password,
                    method: 'POST',
                    headers: {}
                });
                
                aut.then(function(auth) {
                    console.log(auth.data.access_token);
                    $rootScope.auth_token = auth.data.access_token;                
                    $state.go('dashboard');

                }, function(err) {
                  console.log("ERORRRR");
                    $scope.error = 1;
                    $scope.error_text = "Please check your credentials";
                }); 
            }

        }

})
.controller('DashboardCtrl',function($scope,$rootScope,$http,buildings,$rootScope,$interval,$window,$ionicPlatform) {
  
  
   
  $scope.getBuildings = function(){

     var m = buildings.getSites();
            m.then(function(bs){
               
                $scope.abuildings = [];
                bs.data.sites.forEach(function(ssite,index){
                    if(ssite.master){      
                        $scope.abuildings.push(ssite);
                    }
                });
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply()
            }).catch(function(error){
                
                $scope.error = 1;

                $scope.error_text = "Currently there is an error with the database connection. Please try it later";
                $scope.error_msg = error;
                $state.go('login');
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply();
            });
  }

       
})
.controller('SiteCtrl', function($scope, $stateParams, $http,$rootScope) {
  
        $scope.getSiteResources = function(){

            var senss= $http({
              url:"https://api.sparkworks.net/v1/location/site/"+$stateParams.site_id+"/resource",
              method:'GET',
              headers: {"Accept": "application/json","Authorization":"bearer "+$rootScope.auth_token}                    
            });
            senss.then(function(sites){

                $scope.virtual_sensors = [];
                sites.data.resources.forEach(function(thesensor,index){
              
                    if(thesensor.uri.startsWith("gaia-ps")){
                        $scope.virtual_sensors.push(thesensor);
                    }    
                    

                });
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply();

            }).catch(function(error){
                
                $scope.error = 1;
                $scope.error_text = "Currently there is an error with the database connection. Please try it later";
                $scope.error_msg = error;
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply();
            });
        }

       

})
.controller('SensorCtrl', function($scope, $stateParams, $http,$rootScope,$interval,$window,$ionicPlatform) {
      $scope.loading = 1;
      $scope.tvalue = {};
      $scope.tvalue.val = 0;
      $scope.settings={};
      $scope.settings.autogathering = false;
      $scope.lum_measurement = 0;
      $scope.is_lum = false;
      $scope.error = 0;


  $scope.switchAutoGathering= function(){

    if($scope.settings.autogathering){
      $scope.startAutoGathering();
    }
    else
      $scope.stopAutoGathering();
  }
        
  $scope.stopAutoGathering = function(){
    $interval.cancel($scope.sendLight);
    $interval.cancel($scope.getLight);
  }
  $scope.startAutoGathering = function(){
    $ionicPlatform.ready(function() {
      $scope.getLight = $interval(function(){
        window.plugin.lightsensor.getReading(
            function success(reading){
              $scope.lum_measurement = reading.intensity;
            }, 
            function error(message){
             console.log(message);
            }
          );
      }, 500);
    });

    $ionicPlatform.ready(function() {
      $scope.sendLight = $interval(function(){
        window.plugin.lightsensor.getReading(
            function success(reading){
              $scope.tvalue.val = reading.intensity;
              $scope.postmeasurement();
            }, 
            function error(message){
             console.log(message);
            }
          );
      }, 5000);
    });
  }
  $scope.switchAutoGathering();
    



            var details = $http({
                url:'https://api.sparkworks.net/v1/resource/'+$stateParams.sensor_id,
                method:'GET',
                headers: {"Accept": "application/json","Authorization":"bearer "+$rootScope.auth_token},
            });
              details.then(function(details){
                $scope.loading = 0;
                $scope.error = 0;
                $scope.sensor = details.data;
                console.log($scope.sensor);
                if($scope.sensor.property=='Light'){
                  $scope.is_lum = true;

                }
              }).catch(function(error){
                    $scope.loading = 0;
                    $scope.error = 1;    
                    $scope.error_text = "There is an error with database connection";                        
                });


            $scope.postmeasurement = function(){
                
                $scope.loading = 1;
                var data = [];
                data.push({
                    "resourceId": $stateParams.sensor_id,
                    "time": new Date().getTime(),
                    "value": $scope.tvalue.val
                });
                var x = {data:data};

                var req = {
                         method: 'POST',
                         url: 'https://api.sparkworks.net/v1/ps/data',
                         headers: {
                           'Content-Type': 'application/json',"Authorization":"bearer "+$rootScope.auth_token
                         },
                         data: x
                };
                $http(req).then(function(d){
                    $scope.loading = 0;
                    $scope.tvalue.val = 0;
                }).catch(function(error){
                    $scope.loading = 0;
                    $scope.tvalue.val = 0;
                    $scope.error = 1;                            
                });
            }

        $scope.$on('$destroy', function() {
          $scope.stopAutoGathering();
        });

});