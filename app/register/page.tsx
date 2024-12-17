'use client'

import React, { useState, useEffect } from "react";
import styles from "../../styles/PhoneRegistration.module.css"; // CSS module for styling
import axios from "axios";

interface Country {
  name: string;
  flag: string;
  callingCode: string;
}

const PhoneRegistration: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("1"); // Default to USA code
  const [countries, setCountries] = useState<Country[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Fetch countries data on component mount
  useEffect(() => {
    axios
      .get("https://restcountries.com/v3.1/all?fields=name,flags,idd")
      .then((response) => {
        const countryData = response.data.map((country: any) => ({
          name: country.name.common,
          flag: country.flags.svg,
          callingCode: country.idd?.root
            ? `${country.idd.root}${country.idd.suffixes?.[0] || ""}`
            : "1", // Default to 1 if no calling code
        }));
        setCountries(countryData);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  }, []);

  const handleSendOtp = () => {
    if (!phoneNumber) {
      alert("Please enter a valid phone number.");
      return;
    }

    console.log("OTP sent to:", `${countryCode}${phoneNumber}`);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    if (otp === "1234") {
      console.log("OTP verified");
      setIsVerified(true);
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      {!otpSent && !isVerified && (
        <div className={styles.form}>
          <label htmlFor="country">Select Country</label>
          <select
            id="country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            {countries.map((country, index) => (
              <option key={index} value={country.callingCode}>
                {country.flag ? (
                  <>
                    {country.name} ({country.callingCode})
                  </>
                ) : (
                  country.name
                )}
              </option>
            ))}
          </select>

          <label htmlFor="phone">Enter Phone Number</label>
          <div className={styles.phoneInput}>
            <span>{countryCode}</span>
            <input
              type="text"
              id="phone"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <button onClick={handleSendOtp} className={styles.registerButton}>
            Send OTP
          </button>
        </div>
      )}

      {otpSent && !isVerified && (
        <div className={styles.form}>
          <div className={styles.otpSent}>
            OTP has been sent to <strong>{countryCode}{phoneNumber}</strong>.
          </div>
          <label htmlFor="otp">Enter OTP</label>
          <input
            type="text"
            id="otp"
            placeholder="Enter the OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp} className={styles.registerButton}>
            Verify OTP
          </button>
        </div>
      )}

      {isVerified && (
        <div className={styles.form}>
          <div className={styles.otpSent}>Your phone number is verified!</div>
          {/* Add further steps or redirect here */}
        </div>
      )}
    </div>
  );
};

export default PhoneRegistration;
