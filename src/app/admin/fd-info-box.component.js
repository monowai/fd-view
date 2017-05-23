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
        <dl class="dl-horizontal">
          <div ng-repeat="(k,v) in $ctrl.info.state">
            <dt>{{k}}:</dt>
            <dd>{{v}}</dd>
          </div>
        </dl>
      </div>
    </div>
  `
};
