import moment from 'moment';

import {Col} from 'react-bootstrap';

const ChangeLog = ({logSelected, changes, onClick}) => (
  <Col sm={12} md={4} lg={3}>
    <ul className="timeline entity-log">
      {changes.map((logsResult, i) => (
        <li
          key={i}
          onClick={() => logSelected !== logsResult.id && onClick(logsResult.id)}
          className={logsResult.id === logSelected && 'fd-log-selected'}
        >
            < i
className = "fa fa-file-text" / >
  < div
className = "timeline-item" >
  < span
className = "time" >
  < i
className = "fa fa-clock-o"
style = {
{
  marginRight: 5
}
}
/>
{
  moment(logsResult.when).format('YYYY-MM-DD, hh:mm a')
}
<
/span>

< h3
className = "timeline-header" >
  < em > {logsResult.event.name} < /em>
  < /h3>

            <div className="timeline-body">
              <p>
                <strong>{logsResult.madeBy}</strong> - {logsResult.comment}
              </p>
  < br / >
            </div>
          </div>
        </li>
      ))}
    </ul>
  </Col>
);

export default ChangeLog;
