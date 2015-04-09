angular.module('inboxApp', ['ngRoute', 'firebase', 'ui.bootstrap'])

.value('fbURL', 'https://workportal.firebaseio.com/')

.factory('Activities', function($firebase, fbURL) {
    return $firebase(new Firebase(fbURL));
})

.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'InboxCtrl',
            templateUrl: 'inbox.html'
        })
        .otherwise({
            redirectTo: '/'
        });
})

.factory('workingDays', function(){
    function workingDays(startDate, endDate) {

        // Validate input
        if (endDate < startDate)
            return 0;

        // Calculate days between dates
        var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
        startDate.setHours(0,0,0,1);  // Start just after midnight
        endDate.setHours(23,59,59,999);  // End just before midnight
        var diff = endDate - startDate;  // Milliseconds between datetime objects    
        var days = Math.ceil(diff / millisecondsPerDay);

        // Subtract two weekend days for every week in between
        var weeks = Math.floor(days / 7);
        var days = days - (weeks * 2);

        // Handle special cases
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();

        // Remove weekend not previously removed.   
        if (startDay - endDay > 1)         
            days = days - 2;      

        // Remove start day if span starts on Sunday but ends before Saturday
        if (startDay == 0 && endDay != 6)
            days = days - 1  

        // Remove end day if span ends on Saturday but starts after Sunday
        if (endDay == 6 && startDay != 0)
            days = days - 1  

        return days;
    }
    return workingDays;
})

.controller('InboxCtrl', function($scope, $modal, $location, $firebase, Activities, fbURL, workingDays) {
    // Definicion de Variables
    $scope.alerts = [];     // array of alert message objects.
    
    $scope.activities = Activities;
    
    // Cierra el mensaje de alerta
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    // Modal: se llama con edit(activityId)
    $scope.open = function(activityId) {
        var activity = this.activity;
        var modalInstance = $modal.open({
            templateUrl: 'add_activity_modal',
            controller: $scope.model,
            resolve: {
                id: function() {
                    return activityId;
                },
                days: function(){
                    console.log(activity.beginDate);
                    return workingDays(new Date(activity.beginDate), new Date(activity.endDate));
                }
            }
        });
    };

    $scope.model = function($scope, $firebase, fbURL, $modalInstance, Activities, id, days) {
        
        $scope.activity = {};
        
        // array de mensajes de alerta
        $scope.alerts = [];
        
        $scope.designations = [
            {name:'Aprobada', value:'A'}, 
            {name:'Rechazada', value:'R'},
            {name:'', value:'R'}
        ];

        // Si se hace click en editar entonces el id viene desde $scope.modal->activityId
        if (angular.isDefined(id)) {
            var activityUrl = fbURL + id;
            $scope.activity = $firebase(new Firebase(activityUrl));
            $scope.activity.activityId = id;
            
            $scope.days = days;
        }

        // Se cierra la ventana modal
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        // Guarda la actividad editada
        $scope.save = function() {
            $scope.activity.$save();
            $modalInstance.dismiss('cancel');
        };
    };
})