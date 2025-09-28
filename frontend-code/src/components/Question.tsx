import { useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Check, ChevronLeft, Phone, Video, X } from "lucide-react";

interface MCQOption {
  id: string;
  text: string;
}

interface MCQData {
  question: string;
  options: MCQOption[];
  answer: number;
}

const endpoint = "https://localhost";

type PhoneProps = {
  x: number;
  setPausedText: Dispatch<SetStateAction<string>>;
  setAnswered: Dispatch<SetStateAction<boolean>>;
  // new callback: report whether the selected answer was correct
  onAnswered?: (correct: boolean) => void;
};

// let firstRun: boolean = true;

export default function PhoneComponentWithMCQ(props: PhoneProps) {
  const [mcqData, setMcqData] = useState<MCQData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const isInitialMount = useRef(true);
  useEffect(() => {
    // 2. Check if it's the initial mount. If so, skip the effect and update the ref.

    if (isInitialMount.current) {
      console.log("initial x", props.x)
      isInitialMount.current = false;
    } else {
      // 3. On all 
      // subsequent runs (caused by props.x changing), call the function.

      if (props.x!==0) {
        console.log("handleGenerate was run because props.x changed.",props.x );
        handleGenerate();
      }
  
    }
  }, [props.x]);


  

  async function handleGenerate() {
    console.log("this is being called")
    setLoading(true);
    setSelectedOption(null);
    setIsAnswered(false);
    setMcqData(null); // Clear previous question to show loading state

    const prompt =
      'Generate one multiple-choice financial question. Topics: Personal Finance, Corporate Finance, Investment Strategies, Financial Markets, Banking & Financial Institutions, Insurance & Risk Management, Macroeconomics & Finance, Behavioral Finance, Global Trade & Finance, Sustainable Finance, Payments & Banking Tech, Bitcoin & Altcoins, Decentralized Finance (DeFi), Crypto Regulation. Requirements: Question length: ≤150 characters. Each answer length: ≤60 characters. Exactly 4 answers in the "choices" array. The correct answer must be placed at a random index (1–4). The "answer" field must be the number 1, 2, 3, or 4 (not the text). Return ONLY valid JSON in this format, with no extra text: { "question": "the question", "choices": ["answer 1", "answer 2", "answer 3", "answer 4"], "answer": 1}';

    try {
      const response = await fetch(endpoint + "/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const parsed = data.result
      console.log('parsed',parsed);
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
      // Optionally, set an error state here to show in the UI
    } finally {
      setLoading(false);
    }
  }

  const handleOptionClick = (option: MCQOption) => {

    
    if (isAnswered) return; // Prevent changing the answer
    setSelectedOption(option.id);
    const correct = Number(option.id) === mcqData?.answer;
    if (correct) {
      props.setPausedText("Success. You're 100% right.");
    } else {
      const correctAnswerText = mcqData?.options?.[mcqData.answer - 1]?.text;
      props.setPausedText(`Not so fast... The correct answer was "${correctAnswerText}"`);
    }
    setIsAnswered(true); // Lock the answer and reveal correctness
    // inform parent immediately so it can start timers/unpause logic
    try {
      props.setAnswered(true);
    } catch {}
    if (props.onAnswered) props.onAnswered(correct);
  };

  // Helper function to determine the styling for each option button
  const getOptionClasses = (option: MCQOption) => {
    const baseClasses = "w-full p-4 rounded-2xl border-2 transition-all duration-300 ease-in-out transform flex items-center justify-between text-left";

    if (!isAnswered) {
      return `${baseClasses} bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50 active:scale-95`;
    }

    const isCorrect = mcqData?.answer === Number(option.id);
    const isSelected = selectedOption === option.id;

    if (isCorrect) {
      // Style for the correct answer (always green)
      return `${baseClasses} bg-green-500 border-green-600 text-white shadow-lg scale-105 cursor-default`;
    }
    
    if (isSelected && !isCorrect) {
      // Style for a selected, incorrect answer (red)
      return `${baseClasses} bg-red-500 border-red-600 text-white shadow-lg cursor-default`;
    }
    
    // Style for other non-selected, incorrect answers (faded)
    return `${baseClasses} bg-gray-100 border-gray-200 text-gray-500 opacity-60 cursor-default`;
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
          {!mcqData || loading ? (
            <div>
              <h2 className="font-1 font-bold text-center">
                {loading ? "Generating new question..." : "Waiting..."}
              </h2>
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
                    disabled={isAnswered}
                    className={getOptionClasses(option)}
                  >
                    <span className="text-lg font-medium flex-1">
                      {option.text}
                    </span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20 ml-2">
                        {isAnswered && mcqData?.answer === Number(option.id) && (
                            <Check className="w-5 h-5 text-white" />
                        )}
                        {isAnswered && selectedOption === option.id && mcqData?.answer !== Number(option.id) && (
                            <X className="w-5 h-5 text-white" />
                        )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue Button */}
              {/* {isAnswered && (
                // <div className="mt-8">
                //   <button
                //     onClick={() => {
                //         const correct = Number(selectedOption) === mcqData.answer;
                //         if (correct) {
                //           props.setPausedText("Success. You're 100% right.");
                //         } else {
                //           const correctAnswerText = mcqData.options[mcqData.answer - 1]?.text;
                //           props.setPausedText(`Not so fast... The correct answer was "${correctAnswerText}"`);
                //         }
                //         props.setAnswered(true); // Signal to parent that round is over
                //         // report correctness to parent if provided
                //         if (props.onAnswered) props.onAnswered(correct);
                //       }}
                //     className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-colors duration-200"
                //   >
                //     Continue
                //   </button>
                // </div>
              )} */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
