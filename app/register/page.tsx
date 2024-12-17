'use client'

import React, { useState, useEffect, } from "react";
import styles from "../../styles/PhoneRegistration.module.css"; // CSS module for styling
import axios from "axios";
import { useRouter } from "next/router";
interface Country {
  name: string;
  flag: string;
  callingCode: string;
}

const PhoneRegistration: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("1"); // Default to USA code
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);

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

        // Sort countries alphabetically
        countryData.sort((a: Country, b: Country) =>
          a.name.localeCompare(b.name)
        );

        setCountries(countryData);
        setFilteredCountries(countryData);
      })
      .catch((error) => {
      //  console.error("Error fetching countries:", error);
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredCountries(
      countries.filter((country) =>
        country.name.toLowerCase().includes(term)
      )
    );
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only numbers and prevent leading zero
    if (/^[1-9][0-9]*$|^$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      alert("Please enter a valid phone number.");
      return;
    }
  
    const payload = {
      phoneNumber: `${countryCode}${phoneNumber}`.slice(1),
    };
  
    try {
      const VERI_BASEURL = process.env.NEXT_PUBLIC_VERI_BASEURL
      const response = await fetch(`${VERI_BASEURL}/overly/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        return;
      }
  
      const data = await response.json();
     // console.log(data.message); // OTP sent successfully
      setOtpSent(true);
    } catch (error) {
     // console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
  
    const payload = {
      phoneNumber: `${countryCode}${phoneNumber}`.slice(1),
      otp,
    };
  
    try {
      const VERI_BASEURL = process.env.NEXT_PUBLIC_VERI_BASEURL
      const response = await fetch(`${VERI_BASEURL}/overly/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }
  
      const data = await response.json();
     // console.log(data.message); // OTP verified successfully
      localStorage.setItem("code", data.code);
      setIsVerified(true);
      window.location.replace("/chat")
    } catch (error) {
     // console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };
  

  return (
    <div className={styles.container}>
      {!otpSent && !isVerified && (
        <div className={styles.form}>
          {/* {<label htmlFor="countrySearch">Search Country</label>} */}
          <input
            id="countrySearch"
            type="text"
            placeholder="Type to filter..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />

          <label htmlFor="country">Select Country</label>
          <select
            id="country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className={styles.countrySelect}
          >
            {[...filteredCountries,{name:'',flag:'',callingCode:''}].map((country, index) => (
              <option key={index} value={country.callingCode}>
                {/*country.flag*/} {country.name} ({country.callingCode})
              </option>
            ))}
          </select>

          <label htmlFor="phone">Enter Phone Number</label>
          <div className={styles.phoneInput}>
            <span className={styles.countryCode}>{countryCode}</span>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
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
        </div>
      )}
    </div>
  );
};

export default PhoneRegistration;
