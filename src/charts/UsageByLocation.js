import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Chart } from "react-google-charts";
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
        groupBy: COUNTRY
      ) {
        resources {
          country
          usage {
            streamedSubscribedMinutes
          }
        }
      }
    }
  }
`;

class UsageByLocation extends Component {
  getSubscribedData(resources){
    let distinctCountries = resources.filter(x => x.country != null);
    var allCountryData = [];
    var countryData = {};
    distinctCountries.forEach(item => {
      countryData[item.country] = countryData[item.country] || 0;
      countryData[item.country] = round((countryData[item.country] + item.usage.streamedSubscribedMinutes), 4);
    });
    // Compiling null data
    var otherCountriesData = resources.filter(x => x.country == null);;
    var otherData = otherCountriesData.map(item => get(item, 'usage.streamedSubscribedMinutes', 0));
    let numOr0 = n => isNaN(n) ? 0 : n;
    var otherValues = otherData.reduce((a, b) => numOr0(a) + numOr0(b))
    if (otherValues > 0){
      countryData['Others'] = otherValues
    }
    allCountryData = Object.entries(countryData);
    return allCountryData;
  }

  render() {
    return (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading) return <Loading />;
          if (error) return <ErrorMessage error={error.message} />;
          const resources = get(data, 'project.projectData.resources', []);
          const labels = ['Country', 'Subscribed Usage'];
          var countryData = [labels];
          var subscribedCountryData = this.getSubscribedData(resources);
          countryData = countryData.concat(subscribedCountryData);
          return (
            <Chart
              chartType="GeoChart"
              data={countryData}
              width="100%"
              height="400px"
              legendToggle
            />
          );
        }}
      </Query>
    );
  }
}

export default UsageByLocation;
