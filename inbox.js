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

.controller('InboxCtrl', function($scope, $routeParams, $modal, $location, $firebase, Activities, fbURL) {
    // Definicion de Variables
    $scope.alerts = [];     // array of alert message objects.
    
    $scope.activities = Activities;
    
    // Cierra el mensaje de alerta
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    // Modal: se llama con edit(activityId)
    $scope.open = function(activityId) {
        var modalInstance = $modal.open({
            templateUrl: 'add_activity_modal',
            controller: $scope.model,
            resolve: {
                id: function() {
                    return activityId;
                }
            }
        });
    };

    $scope.model = function($scope, $modalInstance, Activities, id, $firebase, fbURL) {
        
        $scope.activity = {};
        
        // array de mensajes de alerta
        $scope.alerts = [];
        
        $scope.designations = [
            {name:'No-Aprobado', value:'NA'}, 
            {name:'Aprobado', value:'A'},
            {name:'', value:'NA'}
        ];

        // Si se hace click en editar entonces el id viene desde $scope.modal->activityId
        if (angular.isDefined(id)) {
            var activityUrl = fbURL + id;
            $scope.activity = $firebase(new Firebase(activityUrl));
            $scope.activity.activityId = id;
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