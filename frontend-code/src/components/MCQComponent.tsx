import React, { useState } from 'react';
import { Check, ChevronLeft, Phone, Video } from 'lucide-react';

interface MCQOption {
  id: string;
  text: string;
}

interface MCQData {
  question: string;
  options: MCQOption[];
}

// Sample data structure - this will come from your Gemini API
const sampleMCQ: MCQData = {
  question: "What's the best way to start your day?",
  options: [
    { id: "a", text: "Drink a glass of water" },
    { id: "b", text: "Check social media" },
    { id: "c", text: "Exercise for 10 minutes" },
    { id: "d", text: "Have a big breakfast" }
  ]
};

function MCQComponent({ mcqData = sampleMCQ, onAnswerSelect }: { 
  mcqData?: MCQData; 
  onAnswerSelect?: (selectedOption: MCQOption) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: MCQOption) => {
    setSelectedOption(option.id);
    onAnswerSelect?.(option);
  };

  return (
    <div className="p-6 bg-white min-h-full">
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
                ? 'bg-green-500 border-green-600 text-white shadow-lg'
                : 'bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium flex-1 text-left">
                {option.text}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedOption === option.id
                  ? 'bg-white border-white'
                  : 'border-gray-300'
              }`}>
                {selectedOption === option.id && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      {selectedOption && (
        <div className="mt-8">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-colors duration-200">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default function PhoneComponentWithMCQ() {
  const [showMCQ, setShowMCQ] = useState(true);

  const handleAnswerSelect = (selectedOption: MCQOption) => {
    console.log('Selected option:', selectedOption);
  };

  return (
    <div className="mockup-phone absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-70">
      <div className="mockup-phone-display bg-base-300">
        {/* Header */}
        <div className='w-full p-5 bg-base-100 flex md:flex-row flex-row items-center border-b border-neutral'>
          <ChevronLeft className='size-6' />
          <p className='font-1 text-left ml-2 font-semibold flex-1'>Quiz Time</p>
          <div className='flex-0 flex flex-row gap-4'>
            <Phone className='size-6' />
            <Video className='size-6' />
          </div>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto">
          {showMCQ ? (
            <MCQComponent onAnswerSelect={handleAnswerSelect} />
          ) : (
            <div className="flex flex-col py-10 gap-2 items-center">
              <div className="p-10 rounded-box bg-primary flex flex-col items-center gap-2">
                <Phone />
                <div>Phone</div>
              </div>
              <button 
                onClick={() => setShowMCQ(true)}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
              >
                Show Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
