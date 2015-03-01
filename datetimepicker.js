angular.module('ui.bootstrap.datetimepicker',
    ["ui.bootstrap.dateparser", "ui.bootstrap.datepicker", "ui.bootstrap.timepicker"]
  )
  .directive('datepickerPopup', function (){
   return {
    restrict: 'EAC',
    require: 'ngModel',
    link: function(scope, element, attr, controller) {
      //remove the default formatter from the input directive to prevent conflict
      controller.$formatters.shift();
    }
   }
  }) 
  .directive('datetimepicker', [
    function() {
      if (angular.version.full < '1.1.4') {
        return {
          restrict: 'EA',
          template: "<div class=\"alert alert-danger\">Angular 1.1.4 or above is required for datetimepicker to work correctly</div>"
        };
      }
      return {
        restrict: 'EA',
        require: 'ngModel',
        scope: {
          ngModel: '=',
          dayFormat: "=",
          monthFormat: "=",
          yearFormat: "=",
          dayHeaderFormat: "=",
          dayTitleFormat: "=",
          monthTitleFormat: "=",
          showWeeks: "=",
          startingDay: "=",
          yearRange: "=",
          dateFormat: "=",
          minDate: "=",
          maxDate: "=",
          dateOptions: "=",
          dateDisabled: "&",
          defaultTime: "=",
          hourStep: "=",
          minuteStep: "=",
          showMeridian: "=",
          meredians: "=",
          mousewheel: "=",
          placeholder: "=",
          readonlyTime: "@"
        },
        template: function(elem, attrs) {
          function dashCase(name, separator) {
            return name.replace(/[A-Z]/g, function(letter, pos) {
              return (pos ? '-' : '') + letter.toLowerCase();
            });
          }

          function createAttr(innerAttr, dateTimeAttrOpt) {
            var dateTimeAttr = angular.isDefined(dateTimeAttrOpt) ? dateTimeAttrOpt : innerAttr;
            if (attrs[dateTimeAttr]) {
              return dashCase(innerAttr) + "=\"" + dateTimeAttr + "\" ";
            } else {
              return '';
            }
          }

          function createFuncAttr(innerAttr, funcArgs, dateTimeAttrOpt) {
            var dateTimeAttr = angular.isDefined(dateTimeAttrOpt) ? dateTimeAttrOpt : innerAttr;
            if (attrs[dateTimeAttr]) {
              return dashCase(innerAttr) + "=\"" + dateTimeAttr + "({" + funcArgs + "})\" ";
            } else {
              return '';
            }
          }

          function createEvalAttr(innerAttr, dateTimeAttrOpt) {
            var dateTimeAttr = angular.isDefined(dateTimeAttrOpt) ? dateTimeAttrOpt : innerAttr;
            if (attrs[dateTimeAttr]) {
              return dashCase(innerAttr) + "=\"" + attrs[dateTimeAttr] + "\" ";
            } else {
              return dashCase(innerAttr);
            }
          }

          function createAttrConcat(previousAttrs, attr) {
            return previousAttrs + createAttr.apply(null, attr)
          }

          var tmpl = "<div class=\"datetimepicker-wrapper\">" +
            "<input class=\"form-control\" type=\"text\" ng-click=\"open($event)\" is-open=\"opened\" ng-model=\"ngModel\" " + [
              ["minDate"],
              ["maxDate"],
              ["dayFormat"],
              ["monthFormat"],
              ["yearFormat"],
              ["dayHeaderFormat"],
              ["dayTitleFormat"],
              ["monthTitleFormat"],
              ["startingDay"],
              ["yearRange"],
              ["datepickerOptions", "dateOptions"]
          ].reduce(createAttrConcat, '') +
            createFuncAttr("dateDisabled", "date: date, mode: mode") +
            createEvalAttr("datepickerPopup", "dateFormat") +
            createEvalAttr("placeholder", "placeholder") +
            "/>\n" +
            "</div>\n" +
            "<div class=\"datetimepicker-wrapper\" ng-model=\"time\" ng-change=\"time_change()\" style=\"display:inline-block\">\n" +
            "<timepicker " + [
              ["hourStep"],
              ["minuteStep"],
              ["showMeridian"],
              ["meredians"],
              ["mousewheel"]
          ].reduce(createAttrConcat, '') +
            createEvalAttr("readonlyInput", "readonlyTime") +
            "></timepicker>\n" +
            "</div>";
          return tmpl;
        },
        controller: ['$scope',
          function($scope) {
            $scope.time_change = function() {
              if (!$scope.ngModel) {
                // This happens when the user has specified a null model date AND the user has specified a defaultTime AND the user changes the timepicker before changing the datepicker.
                $scope.last_date[$scope.$id] = $scope.time;
              }
              if ($scope.ngModel && $scope.time) {
                $scope.ngModel.setHours($scope.time.getHours(), $scope.time.getMinutes());
                $scope.last_date[$scope.$id] = $scope.ngModel;
              }
            }
            $scope.open = function($event) {
              $event.preventDefault();
              $event.stopPropagation();
              $scope.opened = true;
            };
          }
        ],
        link: function(scope, element, attrs) {
          if (typeof scope.last_date === 'undefined') { scope.last_date = [] }
          if (typeof(scope.last_date[scope.$id]) === 'undefined') { scope.last_date[scope.$id] = null; }

          scope.$watch(function() {
            return scope.ngModel;
          }, function(ngModel) {
            if (ngModel) {
              var new_date = new Date(ngModel);
            }
            if (ngModel && !scope.defaultTime) {
              // This happens when the user makes a change to the datepicker AND defaultTime has not been specified.
              scope.time = new Date(ngModel);
            } else if (ngModel && scope.defaultTime) {
              // This happens when the user makes a change to the datepicker AND defaultTime has been specified.
              if (scope.last_date[scope.$id]) {
                scope.time = ngModel = new Date(
                  new_date.getFullYear(),
                  new_date.getMonth(),
                  new_date.getDate(),
                  scope.last_date[scope.$id].getHours(),
                  scope.last_date[scope.$id].getMinutes(),
                  scope.last_date[scope.$id].getSeconds(),
                  0
                );
              } else {
                // This happens on the first edit of the datepicker AND the model date is null.
                scope.time = ngModel = new Date(
                  new_date.getFullYear(),
                  new_date.getMonth(),
                  new_date.getDate(),
                  scope.defaultTime.getHours(),
                  scope.defaultTime.getMinutes(),
                  scope.defaultTime.getSeconds(),
                  0
                );
              }
              scope.time_change();
            } else {
              // This happens when the user has not specified an initial model value AND defaultTime has been specified.
              scope.time = new Date(scope.defaultTime);
            }
            if (ngModel) {
              scope.last_date[scope.$id] = new Date(ngModel);
            }
          });
        }
      }
    }
  ]);
