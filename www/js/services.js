angular.module('starter.services', [])
.factory('buildings', function($http,$rootScope){
    
        return{
            getSites:function(){
                return $http({
                    url:'https://api.sparkworks.net/v1/location/site',
                    method:'GET',
                    data:'',
                    headers: {"Accept": "application/json","Authorization":"bearer "+$rootScope.auth_token}
                })                    
            }
        }
       
});
