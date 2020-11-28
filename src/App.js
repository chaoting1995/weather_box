import React, { useState } from 'react';
import styled from '@emotion/styled'
import dayjs from 'dayjs'
// import { ThemeProvider } from 'emotion-theming';書裡引入方法不能用了
import {ThemeProvider} from '@emotion/react'

import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg';
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg';
import { ReactComponent as RainIcon } from './images/rain.svg';
import { ReactComponent as RefreshIcon } from './images/refresh.svg';

//定義主題配色
const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },

  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherCard= styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
  `;
// 透過 props 取得傳進來的資料
// props 會是 {theme: "dark", children: "台北市"}
const Location = styled.div`
  ${'' /* ${props => console.log(props)} */}
  ${'' /* color: ${props => props.theme === 'dark' ? '#dadada' : '#212121'}; */}
  color: ${({ theme }) => theme.titleColor};
  font-size: 28px;
  margin-bottom: 20px;
`;
  const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;
  
  const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;


const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`;

// const Refresh = styled(RefreshIcon)`
//   /* 在這裡寫入 CSS 樣式 */
//   width: 15px;
//   height: 15px;
//   position: absolute;
//   right: 15px;
//   bottom: 15px;
//   cursor: pointer;
// `;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};
  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
  }
`;

const App = () => {
  // const [currentTheme, setCurrentTheme] = useState('light');
  const [currentTheme, setCurrentTheme] = useState('dark');

   //定義會使用到的資料狀態
   const [currentWeather, setCurrentWeather] = useState({
    observationTime: '2020-12-12 22:10:00',
    locationName: '臺北市',
    description: '多雲時晴',
    windSpeed: 3.6,
    temperature: 32.1,
    rainPossibility: 60,
  });

  const AUTHORIZATION_KEY ='CWB-6F49758A-41B0-438C-B457-08D2C69B013A';
  
  const LOCATION_NAME ='臺北';
    
  //氣象資料開放平臺提供方式
  // const url = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&format=JSON`;

  const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`

  const  handleClick=()=> {
    fetch(url)
    .then( (response) => response.json())
    .then( (data ) => {
      console.log('取得「局屬氣象站-現在天氣觀測報告」data', data);
      //  STEP 1：定義 `locationData` 把回傳的資料中會用到的部分取出來
     const locationData = data.records.location[0];

     // STEP 2：將風速（WDSD）和氣溫（TEMP）的資料取出
     const weatherElements = locationData.weatherElement.reduce(
       (neededElements, item) => {
         if (['WDSD', 'TEMP'].includes(item.elementName)) {
           neededElements[item.elementName] = item.elementValue;
         }
         return neededElements;
       },
       {}
     );

     // STEP 3：要使用到 React 組件中的資料
     setCurrentWeather({
       observationTime: locationData.time.obsTime,
       locationName: locationData.locationName,
       temperature: weatherElements.TEMP,
       windSpeed: weatherElements.WDSD,
       description: '多雲時晴',
       rainPossibility: 60,
     });
  })
  }

  //為何這個沒用？
  // async function handleClick() {
  //   const request = new Request(url, {
  //     method: 'GET',
  //     headers: new Headers({
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     }),
  //   });
  //   const response = await fetch(request);
  //   const data = await response.json();
  //   console.log('取得「局屬氣象站-現在天氣觀測報告」data', data);
  // }
  // // componentDidMount，一掛載就GET會員資料表
  // useEffect(() => {
  //   getDataFromServer();
  //   console.log('一掛載就讀取資料表');
  // }, []);


  return (
    // <ThemeProvider theme={theme.dark}>//寫死的版本
    // <ThemeProvider theme={theme.currentTheme}>//不能寫成這樣會爛掉
    <ThemeProvider theme={theme[currentTheme]}>
    <Container>
      <WeatherCard>
        <Location>{currentWeather.locationName}</Location>
        <Description>{currentWeather.description}</Description>
        <CurrentWeather>
          <Temperature>
          {Math.round(currentWeather.temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <DayCloudy/>
        </CurrentWeather>
        <AirFlow>
        <AirFlowIcon/>
        {currentWeather.windSpeed} m/h
        </AirFlow>
        <Rain>
        <RainIcon/>
        {currentWeather.rainPossibility} %
        </Rain>
        <Refresh>
            最後觀測時間：
            {new Intl.DateTimeFormat('zh-TW', {
              hour: 'numeric',
              minute: 'numeric',
            }).format(dayjs(currentWeather.observationTime))}{' '}
            {/*(new Date(currentWeather.observationTime)) */}
            <RefreshIcon onClick={handleClick}/>
          </Refresh>
      </WeatherCard>
    </Container>
    </ThemeProvider>
  );
};

export default App;
