import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Line } from 'react-chartjs-2';
import { get } from 'lodash';
import moment from 'moment';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const apiKey = process.env.REACT_APP_API_KEY;

const query = gql`
  {
    project(projectId: ${apiKey}) {
      projectData(
        start: ${moment().subtract(500, 'days')},
        interval: WEEKLY
      ) {
        resources {
          intervalStart,
          intervalEnd,
          usage {
            streamedPublishedMinutes,
            streamedSubscribedMinutes,
            individualArchiveMinutes,
            sdBroadcastComposedMinutes,
            sipUserMinutes
          }
        }
      }
    }
  }
`;

class UsageByDay extends Component {
  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          return (
            <Line data={{
              labels: resources.map(item => moment(item.intervalStart).format('MMM DD')),
              datasets: [
                {
                  label: 'Streamed Published Minutes',
                  backgroundColor: 'rgba(75,192,192,0.4)',
                  data: resources.map(item => get(item, 'usage.streamedPublishedMinutes', 0)),
                },
                {
                  label: 'Streamed Subscribed Minutes',
                  backgroundColor: 'rgba(75,75,192,0.4)',
                  data: resources.map(item => get(item, 'usage.streamedSubscribedMinutes', 0)),
                },
                {
                  label: 'Individual Archive Minutes',
                  backgroundColor: '#99004C',
                  data: resources.map(item => get(item, 'usage.individualArchiveMinutes', 0)),
                },
                {
                  label: 'Broadcast Composed Minutes',
                  backgroundColor: '#CC6600',
                  data: resources.map(item => get(item, 'usage.sdBroadcastComposedMinutes', 0)),
                },
                {
                  label: 'SIP User Minutes',
                  backgroundColor: '#3333FF',
                  data: resources.map(item => get(item, 'usage.sipUserMinutes', 0)),
                },
              ],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default UsageByDay;
