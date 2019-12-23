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
        groupBy: BROWSER_VERSION
        browser: [CHROME]
      ) {
        resources {
          browserVersion
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
    let distinctBrowsers = resources.filter(x => x.browserVersion != null);
    var browserData = {};
    var browserName = 'CHROME ';

    distinctBrowsers.forEach(item => {
      browserData[item.browserVersion] = browserData[item.browserVersion] || 0;
      browserData[item.browserVersion] = round((browserData[item.browserVersion] + item.usage.streamedSubscribedMinutes), 2);
    });
    // Compiling null data
    var otherCountriesData = resources.filter(x => x.browserVersion == null);;
    var otherData = otherCountriesData.map(item => get(item, 'usage.streamedSubscribedMinutes', 0));
    let numOr0 = n => isNaN(n) ? 0 : n;
    var otherValues = otherData.reduce((a, b) => numOr0(a) + numOr0(b), 0)
    if (otherValues > 0){
      browserData['Others'] = otherValues
    }

    // Append browser name
    var browserKeys = Object.keys(browserData);
    var labels = [];
    browserKeys.forEach(item => {
      var name = browserName.concat(item);
      labels.push(name)
    })
    return {
      labels: labels,
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
