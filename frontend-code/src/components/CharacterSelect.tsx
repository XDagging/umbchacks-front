import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Character = {
  name: string;
  job: string;
  traits: string[];
  description: string;
};

type CharacterSelectProps = {
  onClose: () => void;
  onConfirm: (character: Character) => void;
};

const CharacterSelect = ({ onClose, onConfirm }: CharacterSelectProps) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCharacters() {
      const prompt = `
      Generate exactly 3 random characters.
      Return ONLY valid JSON (no explanations, no extra text). 

      Format:
      [
        {
          "name": "string",
          "job": "string",
          "traits": ["string", "string", "string"],
          "description": "string"
        },
        {
          "name": "string",
          "job": "string",
          "traits": ["string", "string", "string"],
          "description": "string"
        },
        {
          "name": "string",
          "job": "string",
          "traits": ["string", "string", "string"],
          "description": "string"
        }
      ]
      `;

      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        let result = data.result;
        if (typeof result === "string") {
          result = JSON.parse(result);
        }

        if (Array.isArray(result)) {
          setCharacters(result);
        } else {
          console.error("Invalid result shape:", result);
        }
      } catch (err) {
        console.error("Error fetching characters:", err);
      }
    }

    fetchCharacters();
  }, []);

  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg border-2 border-gray-600 w-11/12 max-w-4xl text-white font-1 relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X size={32} />
        </button>

        {/* Title */}
        <h2 className="text-4xl mb-6 text-primary">Select Your Character</h2>

        {/* Character Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {characters.map((char, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selected === index
                  ? "border-primary bg-[#2a2a2a]"
                  : "border-gray-600 hover:border-primary"
              }`}
              onClick={() => setSelected(index)}
            >
              <h3 className="text-2xl font-bold text-primary">{char.name}</h3>
              <p className="italic mb-2">{char.job}</p>
              <ul className="mb-2 space-y-1 text-sm text-gray-300">
                {char.traits.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
              <p className="text-gray-400 text-sm">{char.description}</p>
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => selected !== null && onConfirm(characters[selected])}
          className={`btn btn-primary mt-8 ${
            selected === null ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={selected === null}
        >
          Confirm Character
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;
