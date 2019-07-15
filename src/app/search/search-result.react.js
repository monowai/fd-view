import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';

// can be refactored and imported from './clean-code.filter'
const cleanCode = code => {
  const keys = code.split('.');
  if (keys.length > 1) {
    return keys
      .filter(key => {
        return key !== 'tag' && key !== 'code';
      })
      .slice(-2)
      .reduce((acc, el) => `${acc}/${el}`);
  }
  return code;
};

const SearchResult = ({entity, setFilter}) => {
  const openDetailsView = e => {
    e.preventDefault();
    window.open(`/view/${entity.key}`); // eslint-disable-line angular/window-service
  };

  return (
    <li>
      <i className="fa fa-file-text" />
      <article className="timeline-item">
    < span
  className = "time" >
    < i
  className = "fa fa-clock-o" / >
    {entity.lastUser} - {moment(entity.lastUpdate
).
  format('ddd, MMM Do YYYY, hh:mm')
}
  {
    ' '
  }
<
  /span>

        <h3 className="timeline-header">
    < a
  href = "#"
  title = "Open details"
  onClick = {openDetailsView} >
    {entity.name}
    < /a>
        </h3>

        <div className="timeline-body">
          {entity.description}

          <div>
            <small>
              {entity.resources.map((resource, ri) => (
                <span key={ri} title={resource.key}>
                  {resource.value.map((value, vi) => (
                    <span key={vi}>
                    < em >
                    < strong > {cleanCode(resource.key
)
}:<
  /strong>
  < /em>
  < span
  className = "search-resources"
  dangerouslySetInnerHTML = {
  {
    __html: value
  }
}
  />
                      <span>;&nbsp;</span>
                    </span>
                  ))}
                </span>
              ))}
            </small>
          </div>

          {entity.whenCreated && (
          < p >
          {/* <!-- ToDo - format the date to the users Locale, not hard coded-->*/}
              <small>
                <b>Created on </b>
          < em >
          {moment(entity.whenCreated
          ).
            format('dddd, MMMM Do YYYY, h:mm:ss a')
          }
          <
            /em> by <em>{entity.lastUser}</
            em >
              </small>
            </p>
          )}
        </div>

  {
    // Carried over from older version of fd-view
          /*
          <a ng-click="findLogs(entity.key, $index)"
             ng-if="!entity.seeLogsAction" class="btn btn-xs btn-primary"><i class="fa fa-angle-double-down"></i> Changes</a>

          <a ng-click="findLogs(entity.key, $index)"
          ng-if="entity.seeLogsAction" class="btn btn-xs btn-primary"><i class="fa fa-angle-double-down"></i> Changes</a>

          <div class="box-body smart-form slide in" ng-if="entity.seeLogsAction">
          <!-- content goes here -->
          <h5 class="todo-group-title"><i class="fa fa-list"></i> Logs</h5>
          <ul class="todo ui-sortable fd-logs">
          <li ng-repeat="logsResult in entity.logs">
          <span class="handle">
          <label class="checkbox">
          <input type="checkbox" ng-click="selectLog(logsResult.id)" name="checkbox-inline">
          </label>
          </span>
          <p>
          <strong>{{logsResult.log.event.name}}</strong> -
          {{logsResult.log.comment}}
          <small>By {{logsResult.log.who.name}}</small>
          [<a ng-click="openPopup(logsResult.id)" class="font-xs">More
          Details</a>] <span class="date">{{logsResult.fortressWhen | amDateFormat:'dddd, MMMM Do YYYY, h:mm:ss a'}}</span>
          </p>
          </li>
          </ul>
          <a class="btn btn-xs btn-primary" ng-if="selectedLog.length === 2"
          ng-click="openDeltaPopup()"><i class="fa fa-indent"></i> Compare Logs</a>
          <!-- end content -->
          </div>
          */
  }

        <div className="timeline-footer">
          {/* <!--<button class="btn btn-xs btn-default">{{entity.event}}</button>-->*/}
    < OverlayTrigger
  placement = "top"
  overlay = { < Tooltip
  id = "code" > {entity.code || entity.name} < /Tooltip>}
    >
    < Button
  bsSize = "xsmall"
  bsStyle = "primary"
  onClick = {openDetailsView} >
              View
            </Button>
          </OverlayTrigger>
    < OverlayTrigger
  placement = "top"
  overlay = { < Tooltip
  id = "fortress" > Filter
  Fortress < /Tooltip>}
  >
  < Button
  bsSize = "xsmall"
  onClick = {()
=>
  setFilter(entity.fortress)
}>
              {entity.fortress}
<
  /Button>
          </OverlayTrigger>
  < OverlayTrigger
  placement = "top"
  overlay = { < Tooltip
  id = "doc-type" > Filter
  Document
  Type < /Tooltip>}
  >
  < Button
  bsSize = "xsmall"
  onClick = {()
=>
  setFilter(entity.fortress, entity.documentType)
}>
              {entity.documentType}
<
  /Button>
          </OverlayTrigger>
  {
    entity.name && (
    < Button
    bsSize = "xsmall"
    onClick = {openDetailsView} >
      {entity.name}
      < /Button>
  )
  }
        </div>
      </article>
    </li>
  );
};

export default SearchResult;
