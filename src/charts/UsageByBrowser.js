import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Pie } from 'react-chartjs-2';
import { get } from 'lodash';
import moment from 'moment';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import round from './helpers/round';

const apiKey = process.env.REACT_APP_API_KEY;

const query = gql`
  {
    project(projectId: ${apiKey}) {
      projectData(
        start: ${moment().subtract(30, 'days')},
        interval: DAILY,
        groupBy: BROWSER
      ) {
        resources {
          browser
          usage {
            streamedSubscribedMinutes
          }
        }
      }
    }
  }
`;

class UsageByBrowser extends Component {
  getSubscribedData(resources){
    let distinctBrowsers = resources.filter(x => x.browser != null);
    var browserData = {};
    distinctBrowsers.forEach(item => {
      browserData[item.browser] = browserData[item.browser] || 0;
      browserData[item.browser] = round((browserData[item.browser] + item.usage.streamedSubscribedMinutes), 2);
    });
    // Compiling null data
    var otherCountriesData = resources.filter(x => x.browser == null);;
    var otherData = otherCountriesData.map(item => get(item, 'usage.streamedSubscribedMinutes', 0));
    let numOr0 = n => isNaN(n) ? 0 : n;
    var otherValues = otherData.reduce((a, b) => numOr0(a) + numOr0(b))
    if (otherValues > 0){
      browserData['Others'] = otherValues
    }

    return {
      labels: Object.keys(browserData),
      browserData: Object.values(browserData)
    }
  }

  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          const {labels, browserData} = this.getSubscribedData(resources);
          return (
            <Pie data={{
              labels: labels,
              datasets: [{
                data: browserData,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#3333FF',
                  '#CC6600'
                ],
              }],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default UsageByBrowser;
