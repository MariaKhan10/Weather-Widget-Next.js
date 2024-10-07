"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

// Define a TypeScript interface for weather data
interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );

      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };
      setWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0)
        return `It's freezing at ${temperature}°C! Bundle up!`;
      if (temperature < 10)
        return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
      if (temperature < 20)
        return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
      if (temperature < 30)
        return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`;
      return `It's hot at ${temperature}°C. Stay hydrated!`;
    }
    return `${temperature}°${unit}`;
  }

  function getWeatherMessage(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny":
        return "It's a beautiful sunny day!";
      case "partly cloudy":
        return "Expect some clouds and sunshine.";
      case "cloudy":
        return "It's cloudy today.";
      case "overcast":
        return "The sky is overcast.";
      case "rain":
        return "Don't forget your umbrella! It's raining.";
      case "thunderstorm":
        return "Thunderstorms are expected today.";
      case "snow":
        return "Bundle up! It's snowing.";
      case "mist":
        return "It's misty outside.";
      case "fog":
        return "Be careful, there's fog outside.";
      default:
        return description;
    }
  }

  function getLocationMessage(location: string): string {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;
    return `${location} ${isNight ? "at Night" : "During the Day"}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-6 text-center shadow-xl bg-white rounded-lg">
        <CardHeader>
          <div className="flex flex-col items-center">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              Weather Widget
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Check the current weather in your city.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex gap-4 items-center justify-center mb-6"
          >
            <Input
              type="text"
              placeholder="Enter city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocation(e.target.value)
              }
              className="w-2/3 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className={`p-3 text-white rounded-md transition-all duration-300 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {weather && (
            <div className="text-left text-lg text-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <ThermometerIcon className="w-8 h-8 text-red-500" />
                <span>
                  {getTemperatureMessage(weather.temperature, weather.unit)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <CloudIcon className="w-8 h-8 text-blue-500" />
                <span>{getWeatherMessage(weather.description)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-8 h-8 text-green-500" />
                <span>{getLocationMessage(weather.location)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
