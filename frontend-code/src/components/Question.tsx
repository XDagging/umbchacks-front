import React, { useState } from "react";
import { Check, ChevronLeft, Phone, Video } from "lucide-react";

interface MCQOption {
  id: string;
  text: string;
}

interface MCQData {
  question: string;
  options: MCQOption[];
  answer?: number;
}

export default function PhoneComponentWithMCQ() {
  const [mcqData, setMcqData] = useState<MCQData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setSelectedOption(null);

    const prompt = `Generate one multiple-choice financial question. 
    Topics: Personal Finance, Corporate Finance, Investment Strategies, Financial Markets, 
    Banking & Financial Institutions, Insurance & Risk Management, Macroeconomics & Finance, 
    Behavioral Finance, Global Trade & Finance, Sustainable Finance, Payments & Banking Tech, 
    Bitcoin & Altcoins, Decentralized Finance (DeFi), Crypto Regulation.   
    Requirements:   
    Question: <= 150 characters.   
    Each answer: <= 60 characters.   
    Exactly 4 answers in an array.   
    Provide correct answer as 1,2,3, or 4.   
    Return ONLY valid JSON in this format:   
    {
      "question": "the question",
      "choices": ["answer 1", "answer 2", "answer 3", "answer 4"],
      "answer": 1
    }`;

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();

    try {
      const parsed = JSON.parse(data.result);
      setMcqData({
        question: parsed.question,
        options: parsed.choices.map((choice: string, idx: number) => ({
          id: (idx + 1).toString(),
          text: choice,
        })),
        answer: parsed.answer,
      });
    } catch (err) {
      console.error("Failed to parse question:", err);
    }

    setLoading(false);
  }

  const handleOptionClick = (option: MCQOption) => {
    setSelectedOption(option.id);
  };

  return (
    <div className="mockup-phone absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-70">
      <div className="mockup-phone-display bg-base-300">
        {/* Header */}
        <div className="w-full p-5 bg-base-100 flex flex-row items-center border-b border-neutral">
          <ChevronLeft className="size-6" />
          <p className="font-1 text-left ml-2 font-semibold flex-1">Quiz Time</p>
          <div className="flex-0 flex flex-row gap-4">
            <Phone className="size-6" />
            <Video className="size-6" />
          </div>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto p-6">
          {!mcqData ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
              >
                {loading ? "Generating..." : "Generate Question"}
              </button>
            </div>
          ) : (
            <>
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 text-center leading-tight">
                  {mcqData.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {mcqData.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ease-in-out transform active:scale-95 ${
                      selectedOption === option.id
                        ? "bg-green-500 border-green-600 text-white shadow-lg"
                        : "bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium flex-1 text-left">
                        {option.text}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.id
                            ? "bg-white border-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedOption === option.id && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue */}
              {selectedOption && (
                <div className="mt-8">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-colors duration-200">
                    Continue
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
