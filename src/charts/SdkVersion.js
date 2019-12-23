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
        groupBy: SDK_VERSION
      ) {
        resources {
          sdkType,
          usage {
            streamedSubscribedMinutes
          }
        }
      }
    }
  }
`;

class SdkDistribution extends Component {
  getSubscribedData(resources){
    let distinctData = resources.filter(x => x.sdkVersion != null);
    var subscribedData = {};
    distinctData.forEach(item => {
      subscribedData[item.sdkVersion] = subscribedData[item.sdkVersion] || 0;
      subscribedData[item.sdkVersion] = round((subscribedData[item.sdkVersion] + item.usage.streamedSubscribedMinutes), 2);
    });
    // Compiling null data
    var otherSubscribedData = resources.filter(x => x.sdkVersion == null);;
    var otherData = otherSubscribedData.map(item => get(item, 'usage.streamedSubscribedMinutes', 0));
    let numOr0 = n => isNaN(n) ? 0 : n;
    var otherValues = otherData.reduce((a, b) => numOr0(a) + numOr0(b), 0)
    if (otherValues > 0){
      subscribedData['Unknown'] = otherValues
    }

    return {
      labels: Object.keys(subscribedData),
      subscribedData: Object.values(subscribedData)
    }
  }

  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          const {labels, subscribedData} = this.getSubscribedData(resources);
          return (
            <Pie data={{
              labels: labels,
              datasets: [{
                label: 'SDK Versions',
                backgroundColor: '#36A2EB',
                data: subscribedData,
              }],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default SdkDistribution;
