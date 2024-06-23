"use client";
import { CheckIcon } from "lucide-react";
import React, { FormEventHandler, useEffect, useState } from "react";
import { Account, Chain, Hex, Transport, WalletClient } from "viem";
import { Call, Contract } from "starknet";
import { erc20Abi } from "@/app/challenge/abi2";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

import Tesseract from "tesseract.js";

const ScoreChallenge: React.FC = () => {
  const [step, setStep] = useState(1);
  const [challengeName, setChallengeName] = useState("");
  const [organization, setOrginization] = useState("");
  const [scoreGoal, setScoreGoal] = useState(50);
  const [projectName, setProjectName] = useState("");
  const [verificationResult, setVerificationResult] = useState("");
  const [targetScore, setTargetScore] = useState(50);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const { primaryWallet } = useDynamicContext();

  const [txnHash, setTxnHash] = useState("");

  //   if (!primaryWallet) return null;

  const handleNext = () => {
    setStep(step + 1);
  };
  const handlePrev = () => {
    setStep(step - 1);
  };
  const handleSubmit = async () => {
    await onSubmit();
    setStep(3);
  };

  const handleFileUpload = (e: any) => {
    setLoading(true);
    console.log(e);
    const file = e.target.files[0];
    setCertificate(file);
    if (file) {
      console.log("Is file ");
      performOCR(file);
    }
  };

  const performOCR = (file: any) => {
    const reader = new FileReader();
    reader.onload = () => {
      Tesseract.recognize(reader.result, "eng")
        .then(({ data: { text } }) => {
          setOcrText(text);
          verifyCertificate(text);
          console.log("OCR Result:", text);
        })
        .catch((err) => {
          console.error("OCR Error:", err);
        });
    };
    reader.readAsDataURL(file);
  };

  const verifyCertificate = async (text: any) => {
    // const scorePattern = /\b\d{1,3}%\b/; // Regex to find percentage values
    // const scoreMatch = text.match(scorePattern);
    // const score = scoreMatch ? parseInt(scoreMatch[0]) : 0;
    const organizationName = organization;
    const courseName = challengeName;

    console.log("Actuall DTAATA", organization, challengeName);

    // const isScoreValid = score >= targetScore;
    const isOrganizationValid = text.includes(organizationName);
    const isCourseValid = text.includes(courseName);

    if (isOrganizationValid && isCourseValid) {
      setVerificationResult("Certificate is valid.");
    } else {
      setVerificationResult("Certificate is invalid.");
    }
    setLoading(false);
  };

  const handlecertificateSubmission = async () => {};

  const onSubmit = async () => {
    try {
      const provider = await primaryWallet?.connector.getSigner<
        WalletClient<Transport, Chain, Account>
      >();
      if (!provider) return;

      const challgenContract = new Contract(
        erc20Abi.abi,
        "0x00f3cb78a013aaa36c2a9bdcb214aed944281ad0acb4a80b1306c06ee57eb678",
        provider as any
      );
      const transferCallData: Call = challgenContract.populate(
        "challengeAndDeposit",
        {
          amount: 1,
          challenge: scoreGoal,
        }
      );
      const { transaction_hash: transferTxHash } =
        await challgenContract.challengeAndDeposit(transferCallData.calldata);

      const hash = await provider.waitForTransaction(transferTxHash);

      setTxnHash(hash.transaction_hash);
    } catch (e: any) {
      console.log("error");
      console.log(e);
    }
  };

  const onFinish = async () => {
    try {
      const provider = await primaryWallet?.connector.getSigner<
        WalletClient<Transport, Chain, Account>
      >();
      if (!provider) return;

      const challgenContract = new Contract(
        erc20Abi.abi,
        "0x00f3cb78a013aaa36c2a9bdcb214aed944281ad0acb4a80b1306c06ee57eb678",
        provider as any
      );
      const transferCallData: Call = challgenContract.populate("withdraw", {
        amount: 1,
      });

      console.log("transfer call data ", transferCallData);
      const { transaction_hash: transferTxHash } =
        await challgenContract.withdraw(transferCallData.calldata);
      console.log("transaction hash ", transferTxHash);

      const hash = await provider.waitForTransaction(transferTxHash);

      console.log(hash);

      setTxnHash(hash.transaction_hash);
    } catch (e: any) {
      console.log("error");
      console.log(e);
    }
  };

  const scores = async () => {
    try {
      const provider = await primaryWallet?.connector.getSigner<
        WalletClient<Transport, Chain, Account>
      >();
      if (!provider) return;
      let currentCal = 500;

      const challgenContract = new Contract(
        erc20Abi.abi,
        "0x00f3cb78a013aaa36c2a9bdcb214aed944281ad0acb4a80b1306c06ee57eb678",
        provider as any
      );
      const transferCallData: Call = challgenContract.populate("scores", {
        scores: currentCal,
      });
      const { transaction_hash: transferTxHash } =
        await challgenContract.scores(transferCallData.calldata);

      const hash = await provider.waitForTransaction(transferTxHash);

      setTxnHash(hash.transaction_hash);
    } catch (e: any) {
      console.log("error");
      console.log(e);
    }

    // await onFinish();
  };

  // console.log("OCR TEXT", ocrText);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      data-id="element-0"
    >
      {loading && (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      )}
      <div
        className="bg-white rounded-lg shadow-lg p-8 m-4 max-w-sm md:max-w-lg w-full"
        data-id="element-1"
      >
        {step === 1 && (
          <div data-id="element-3">
            <p className="mb-6 text-center" data-id="element-4">
              Welcome! Let's set up your project completion challenge. First,
              give your course name and Organization.
            </p>
            <div className="mb-4" data-id="element-5">
              <label
                htmlFor="challengeName"
                className="block mb-1 font-bold"
                data-id="element-6"
              >
                Course Name
              </label>
              <input
                type="text"
                id="challengeName"
                className="w-full border-black border-2 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                data-id="element-7"
              />
            </div>
            <div className="mb-4" data-id="element-5">
              <label
                htmlFor="challengeName"
                className="block mb-1 font-bold"
                data-id="element-6"
              >
                Organization
              </label>
              <input
                type="text"
                id="challengeName"
                className="w-full border-black border-2 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={organization}
                onChange={(e) => setOrginization(e.target.value)}
                data-id="element-7"
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-blue-200 hover:bg-blue-200 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
              data-id="element-8"
            >
              Next
            </button>
          </div>
        )}
        {step === 2 && (
          <div data-id="element-9">
            <p className="mb-6 text-center" data-id="element-10">
              Set your target score for the project completion. Use the slider
              or input your target percentage directly.
            </p>
            <div className="mb-8" data-id="element-11">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={scoresGoal}
                onChange={(e) => setscoreGoal(Number(e.target.value))}
                className="w-full accent-cyan-300"
                data-id="element-12"
              />
              <div
                className="flex justify-between text-sm"
                data-id="element-13"
              >
                <span data-id="element-14">10</span>
                <span data-id="element-15">{scoreGoal} %</span>
                <span data-id="element-16">100</span>
              </div>
            </div>
            <div className="flex justify-between" data-id="element-17">
              <button
                onClick={handlePrev}
                className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                data-id="element-18"
              >
                Prev
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-200 hover:bg-blue-200 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                data-id="element-19"
              >
                Create
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div data-id="element-43">
            <div
              className="flex flex-col items-center justify-center space-y-6"
              data-id="element-44"
            >
              <CheckIcon
                className="w-16 h-16 text-lime-400"
                data-id="element-45"
              />
              <h3 className="text-2xl font-bold" data-id="element-46">
                Challenge Created Successfully!
              </h3>
              <p className="text-center" data-id="element-47">
                Your Project completion challenge has been created. Here's a
                summary:
              </p>
              <div
                className="bg-blue-200 p-4 rounded-md border-2 border-black"
                data-id="element-48"
              >
                <p data-id="element-49">
                  <strong data-id="element-50">Course Name:</strong>{" "}
                  {challengeName}
                </p>
                <p data-id="element-51">
                  <strong data-id="element-52">Target Percentage Goal:</strong>{" "}
                  {scoreGoal} %
                </p>
                <p data-id="element-51">
                  <strong data-id="element-52">Hash:</strong>{" "}
                  {`${txnHash?.substring(0, 20)}....`}
                </p>
              </div>
              {/* {isSignedIn ? ( */}
              <div className="p-4">
                <button
                  className="bg-blue-200 hover:bg-blue-400 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                  data-id="element-55"
                  onClick={() => {
                    setStep(4);
                  }}
                >
                  Submit Completion Certificate
                </button>
                {/* <button
                  className="bg-cyan-300 hover:bg-cyan-400 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                  data-id="element-55"
                  onClick={onFinish}
                >
                  End Challenge 
                </button> */}
              </div>
              {/* ) : (
                <div>
                  <button
                    className="bg-cyan-300 hover:bg-cyan-400 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                    data-id="element-55"
                    onClick={handleSignIn}
                  >
                    Sing In
                  </button>
                </div>
              )} */}
            </div>
          </div>
        )}
        {step === 4 && (
          <div data-id="element-9">
            <h4 className="text-2xl font-bold mb-8" data-id="element-46">
              Upload Your Certificate
            </h4>
            <div className="mb-8" data-id="element-11">
              <input
                type="file"
                id="certificate"
                onChange={handleFileUpload}
                required
                className="w-full mb-4"
              />
              {/* {ocrText && (
                <div className="mt-4">
                  <h3>Extracted Text from Certificate:</h3>
                  <p>{ocrText}</p>
                </div>
              )} */}
              <div
                className="flex justify-between text-sm"
                data-id="element-13"
              ></div>
            </div>
            <div className="flex justify-between" data-id="element-17">
              <button
                onClick={handlePrev}
                className="bg-blue-300 hover:bg-blue-400 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                data-id="element-19"
              >
                Prev
              </button>
              <button
                onClick={scores}
                className="bg-blue-200 hover:bg-blue-400 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                data-id="element-19"
              >
                Submit
              </button>
            </div>
            {verificationResult && (
              <div className="mt-4">
                <h3 className="font-bold">Verification Result:</h3>
                <p className="italic">{verificationResult}</p>
                {verificationResult === "Certificate is valid." && (
                  <button
                    onClick={onFinish}
                    className="bg-blue-200 hover:bg-blue-400 text-black font-bold py-2 px-4 border-2 border-black rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition duration-200"
                    data-id="element-19"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessChallenge;
