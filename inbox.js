viewsModule.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'InboxCtrl',
            templateUrl: 'inbox.html'
        });
});

viewsModule.controller('InboxCtrl', function($rootScope, $scope, $modal, $location, $firebase, Activities, fbURL, workingDays) {
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
            templateUrl: 'activity-template.html',
            controller: $scope.model,
            resolve: {
                id: function() {
                    return activityId;
                },
                days: function(){
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
});