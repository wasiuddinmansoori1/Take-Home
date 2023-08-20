import React, { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";


export const CountButton = () => {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let confettiTimeout;
    if (showConfetti) {
      confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      return () => {
        clearTimeout(confettiTimeout);
      };
    }
  }, [showConfetti]);

  const searchLocation = async () => {
    try {
      setIsLoading(true);
      setLocation("Fetching location...");

      if (!navigator.onLine) {
        setLocation("No internet connection. Please check your connection.");
        return;
      }

      const ipifyResponse = await axios.get("https://api64.ipify.org?format=json");
      const userIP = ipifyResponse.data.ip;

      const token = process.env.PLASMO_PUBLIC_TOKEN;

      let ipinfoResponse;
      let retryCount = 0;
      const maxRetries = 3;

      do {
        if (retryCount > 0) {
          const backoffDelay = Math.pow(2, retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }

        ipinfoResponse = await axios.get(`http://ipinfo.io/${userIP}?token=${token}`);

        retryCount++;
      } while (ipinfoResponse.status === 429 && retryCount <= maxRetries);

      if (ipinfoResponse.status === 200) {
        const { country, city } = ipinfoResponse.data;
        setLocation(`Your country is ${country} and city is ${city}`);
        setShowConfetti(true);
      } else {
        setLocation("Error fetching location. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation("Error fetching location. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={["#FFD700", "#FF4500", "#00FF00", "#00BFFF"]}
          gravity={0.2}
        />
      )}
      <p
        className={`plasmo-mt-2 plasmo-text-white plasmo-font-bold plasmo-text-xl plasmo-mb-8 ${
          !navigator.onLine && "plasmo-text-center"
        }`}
      >
        {location}
      </p>
      <button
        onClick={searchLocation}
        type="button"
        className={`plasmo-rounded-full plasmo-px-4 plasmo-py-2 plasmo-bg-blue-600 plasmo-text-white plasmo-font-bold plasmo-shadow-md plasmo-transition plasmo-duration-500 plasmo-ease-in-out hover:plasmo-bg-blue-700 ${
          isLoading ? "plasmo-opacity-50 plasmo-cursor-not-allowed" : ""
        } plasmo-focus:plasmo-outline-none plasmo-focus:plasmo-shadow-outline`}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Show My Location"}
      </button>
    </div>
  );
};
