import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { HorizontalBar } from 'react-chartjs-2';
import { get } from 'lodash';
import moment from 'moment';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const apiKey = process.env.REACT_APP_API_KEY;

const query = gql`
  {
    project(projectId: ${apiKey}) {
      projectData(
        start: ${moment().subtract(30, 'days')},
        groupBy: COUNTRY
      ) {
        resources {
          country,
          quality {
            subscriber {
              latencyMsAvg
            }
          }
        }
      }
    }
  }
`;

class LatencyByCountry extends Component {
  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          return (
            <HorizontalBar data={{
              labels: resources.map(item => item.country),
              datasets: [{
                label: 'Avg. latency',
                backgroundColor: '#36A2EB',
                data: resources.map(item => get(item, 'quality.subscriber.latencyMsAvg', 0)),
              }],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default LatencyByCountry;
