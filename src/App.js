import React, { useCallback,useState,useEffect, useMemo } from 'react';

// import { ThemeProvider } from 'emotion-theming';書裡引入方法不能用了
import {ThemeProvider} from '@emotion/react'
import WeatherCard from './views/WeatherCard';
import WeatherSetting from './views/WeatherSetting';
import { getMoment } from './utils/helpers'
import styled from '@emotion/styled';

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


const AUTHORIZATION_KEY ='CWB-6F49758A-41B0-438C-B457-08D2C69B013A';
const LOCATION_NAME ='臺北';
const LOCATION_NAME_FORECAST ='臺北市';


  //氣象資料開放平臺提供方式
  // const url = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&format=JSON`;

  const  fetchCurrentWeather=()=> {
    // //拉取資料前，設定載入指示器的狀態為true
    //   setWeatherElement((prevState) => ({
    //     ...prevState,
    //     isLoading: true,
    //   }));

    const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`
    
    return fetch(url)
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
    //  setWeatherElement((prevState)=>({
    //   ...prevState,
    //    observationTime: locationData.time.obsTime,
    //    locationName: locationData.locationName,
    //    temperature: weatherElements.TEMP,
    //    windSpeed: weatherElements.WDSD,
    //    isLoading: false,
    //  }));

    return{
         observationTime: locationData.time.obsTime,
         locationName: locationData.locationName,
         temperature: weatherElements.TEMP,
         windSpeed: weatherElements.WDSD,
       }
  })
  }



  const  fetchWeatherForecast = () => {
  
    //拉取資料前，設定載入指示器的狀態為true
      // setWeatherElement((prevState) => ({
      //   ...prevState,
      //   isLoading: true,
      // }));

    const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}`
    
    return fetch(url)
    .then( (response) => response.json())
    .then( (data ) => {
      console.log('取得「一般天氣預報-今明 36 小時天氣預報」data', data);
      //  STEP 1：定義 `locationData` 把回傳的資料中會用到的部分取出來
     const locationData = data.records.location[0];

     // STEP 2：取出 天氣現象'Wx', 降雨機率'PoP',舒適度 'CI'
     const weatherElements = locationData.weatherElement.reduce(
      (neededElements, item) => {
        if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
          neededElements[item.elementName] = item.time[0].parameter;
        }
        return neededElements;
       },
       {}
     );

     return{
      description: weatherElements.Wx.parameterName,
      weatherCode: weatherElements.Wx.parameterValue,
      rainPossibility: weatherElements.PoP.parameterName,
      comfortability: weatherElements.CI.parameterName,
     };
  })
  }


const App = () => {
  // const [currentTheme, setCurrentTheme] = useState('light');
  const [ currentTheme , setCurrentTheme ] = useState('light');
  const [ currentPage , setCurrentPage ] = useState('WeatherCard');
const handleCurrentPageChange = (currentPage) => {
  setCurrentPage(currentPage);

}

   //定義會使用到的資料狀態
  //  const [currentWeather, setWeatherElement] = useState({
    const [weatherElement, setWeatherElement] = useState({
      observationTime: new Date(),
      locationName: '',
      temperature: 0,
      windSpeed: 0,
      description: '',
      weatherCode: 0,
      rainPossibility: 0,
      comfortability: '',
      isLoading: true,
  });
 
  //判斷日夜( getMoment，傳入城市，回傳day or night)
  // 錯誤示範：const moment = useMemo(()=>{ getMoment(LOCATION_NAME_FORECAST); },[]) //抓了半天的臭蟲
  const moment = useMemo(() => getMoment(LOCATION_NAME_FORECAST), []);
  //依日夜變更主題
  useEffect(() => {
    setCurrentTheme( moment === 'day' ? 'light' : 'dark');
  },[])

  const fetchData = useCallback(async () => {
      //拉取資料前，設定載入指示器的狀態為true
      setWeatherElement((prevState) => ({
        ...prevState,
        isLoading: true,
      }));

      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);
    
    // console.log('一掛載就讀取「局屬氣象站-現在天氣觀測報告」&「一般天氣預報-今明 36 小時天氣預報」',data);
    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    });
  },[]);
  
  // // componentDidMount，一掛載就GET資料
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
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


  return (
    // <ThemeProvider theme={theme.dark}>//寫死的版本
    // <ThemeProvider theme={theme.currentTheme}>//不能寫成這樣會爛掉
    <ThemeProvider theme={theme[currentTheme]}>
    <Container>
    {currentPage === 'WeatherCard' && (
      <WeatherCard
        weatherElement={weatherElement}
        moment={moment}
        fetchData={fetchData}
        handleCurrentPageChange={handleCurrentPageChange}
      />
      )}
    {currentPage === 'WeatherSetting' && (
      <WeatherSetting handleCurrentPageChange={handleCurrentPageChange}/>
    )}
    </Container>
  </ThemeProvider>
  );
};

export default App;
