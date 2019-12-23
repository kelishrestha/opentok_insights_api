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
        groupBy: SDK_TYPE,
        sdkType: [JS, ANDROID, IOS, WINDOWS, OTHER]
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
    let distinctdata = resources.filter(x => x.sdkType != null);
    var subscribedData = {};
    distinctdata.forEach(item => {
      subscribedData[item.sdkType] = subscribedData[item.sdkType] || 0;
      subscribedData[item.sdkType] = round((subscribedData[item.sdkType] + item.usage.streamedSubscribedMinutes), 2);
    });
    // Compiling null data
    var otherSubscribedData = resources.filter(x => x.sdkType == null);;
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
                data: subscribedData,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56'
                ],
              }],
            }} />
          );
        }}
      </Query>
    );
  }
}

export default SdkDistribution;
