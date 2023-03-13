import axios from "axios"

export function getWeather(lat, lon, timezone) {
    return axios.get("https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,relativehumidity_2m,precipitation,rain,weathercode,windspeed_10m,windspeed_120m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime",
    { params: {
        latitude: lat,
        longitude: lon,
        timezone,
            }
        }
    )
    .then(({ data }) => {
        
        return {
            currently: parseCurrentWeather(data),
            // daily: parseDailyWeather(data),
            // hourly: parseHourlyWeather(data),
            }
        })
}

// parsing the current weather {}

function parseCurrentWeather({ current_weather, daily}) {
    const { temperature: currentTemp,
            weatherCode : iconCode,
            windSpeed: windSpeed, 
        } = current_weather;

    const {
        temperature_2m_max: [maxTemp],
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFeelsLike],
        apparent_temperature_min: [minFeelsLike],
        precipitation_sum: [precip],
    } = daily;

    return {
        currentTemp: Math.round(currentTemp),
        hignTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),

        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip*100) / 100,
        iconCode: Math.round(iconCode),
    }
}

// parsing daily data

function parseDailyWeather({daily}) {
    return daily.time.map((time, index) => {
        return {
           timestamp: time * 1000,
            iconCode: daily.weatherCode[index],
            maxTemp: Math.round(daily.temperature_2m_max[index]),
        }
    })
}

// parsing hourly data

function parseHourlyWeather(hourly, current_weather) {
    return hourly.time.map( (time,index) => {
        return {
            timestamp: time * 1000,
            iconCode: hourly.weatherCode[index],
            temp: Math.round(hourly.temperature_2m_max[index]),
            precip: Math.round(hourly.precipitation_sum[index] * 100) / 100,
            humidity: Math.round(hourly.relativehumidity_2m[index]),
            windSpeed: Math.round(hourly.windspeed_10m[index]),
        }
    }).filter(({timestamp}) => timestamp >= current_weather.time * 1000)
}