import React, { Component } from 'react';
import ChartContainer from './components/ChartContainer';
import TableContainer from './components/TableContainer';
import UsageByDay from './charts/UsageByDay';
import UsageByLocation from './charts/UsageByLocation';
import UsageByBrowser from './charts/UsageByBrowser';
import UsageByBrowserVersion from './charts/UsageByBrowserVersion';
import UsageBySession from './charts/UsageBySession';
import SdkDistribution from './charts/SdkDistribution';
import SdkVersion from './charts/SdkVersion';
import FailuresByBrowser from './charts/FailuresByBrowser';
import FailuresBySdkType from './charts/FailuresBySdkType';
import BitrateByCountry from './charts/BitrateByCountry';
import LatencyByCountry from './charts/LatencyByCountry';
import VideoStats from './charts/VideoStats';
import './css/App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ChartContainer titleIcon="area" title="Usage by Day">
          <UsageByDay />
        </ChartContainer>
        <ChartContainer titleIcon="geo" title="Usage by Location">
          <UsageByLocation />
        </ChartContainer>
        <ChartContainer titleIcon="geo" title="Usage by Browser">
          <UsageByBrowser />
        </ChartContainer>
        <ChartContainer titleIcon="geo" title="Usage by Browser Version">
          <UsageByBrowserVersion />
        </ChartContainer>
        <ChartContainer titleIcon="pie" title="SDK Distribution">
          <SdkDistribution />
        </ChartContainer>
        <ChartContainer titleIcon="pie" title="SDK Versions">
          <SdkVersion />
        </ChartContainer>
        <ChartContainer titleIcon="bar" title="Failures by Browser">
          <FailuresByBrowser />
        </ChartContainer>
        <ChartContainer titleIcon="bar" title="Failures by SDK">
          <FailuresBySdkType />
        </ChartContainer>

        <h2>&nbsp;&nbsp;Subscribers</h2>
        <ChartContainer titleIcon="bar" title="Bitrate by Country" userType="subscriber">
          <BitrateByCountry />
        </ChartContainer>
        <ChartContainer titleIcon="bar" title="Latency by Country">
          <LatencyByCountry />
        </ChartContainer>
        {/* <ChartContainer titleIcon="area" title="Publisher Video Bitrate">
          <VideoStats />
        </ChartContainer>
        <TableContainer titleIcon="table" title="Publisher and Subscriber minutes by Session">
          <UsageBySession />
        </TableContainer> */}
      </div>
    );
  }
}

export default App;
