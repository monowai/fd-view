export const fdInfoBox = {
  bindings: {
    info: '<'
  },
  controller: class fdInfoBoxCtrl {},
  transclude: true,
  template: ` 
    <div class="box box-default">
      <div class="box-header with-border">
        <h3 class="box-title">{{$ctrl.info.title}}</h3>
        <ng-transclude></ng-transclude>
      </div>
      <div class="box-body">
        <json-view src="$ctrl.info.state" name="false" displayObjectSize="false" displayDataTypes="false"></json-view>
      </div>
    </div>
  `
};
