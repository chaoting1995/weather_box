import { useCallback, useState, useEffect } from 'react';

//   const AUTHORIZATION_KEY ='CWB-6F49758A-41B0-438C-B457-08D2C69B013A';
//   const LOCATION_NAME ='臺北';
//   const LOCATION_NAME_FORECAST ='臺北市';

//氣象資料開放平臺提供方式
// const url = `https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&format=JSON`;

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
  // //拉取資料前，設定載入指示器的狀態為true
  //   setWeatherElement((prevState) => ({
  //     ...prevState,
  //     isLoading: true,
  //   }));

  const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
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

      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
      };
    });
};

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
  //拉取資料前，設定載入指示器的狀態為true
  // setWeatherElement((prevState) => ({
  //   ...prevState,
  //   isLoading: true,
  // }));

  const url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
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

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

// 為何這個沒用？
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

const useWeatherAPI = ({ authorizationKey, cityName, locationName }) => {
  //定義會使用到的資料狀態
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

  //透過useCallback，定義fetchData
  const fetchData = useCallback(async () => {
    //拉取資料前，設定載入指示器的狀態為true
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    const [currentWeather, weatherForecast] = await Promise.all([
      fetchCurrentWeather({ authorizationKey, locationName }),
      fetchWeatherForecast({ authorizationKey, cityName }),
    ]);

    // console.log('一掛載就讀取「局屬氣象站-現在天氣觀測報告」&「一般天氣預報-今明 36 小時天氣預報」',data);
    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    });
  }, [authorizationKey, cityName, locationName]);

  //透過useEffect，呼叫fetchData

  // componentDidMount，一掛載就GET資料
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //Custom Hooks的關鍵之處，回傳要讓其他元件使用資料或方法
  return [weatherElement, fetchData];
};

export default useWeatherAPI;
