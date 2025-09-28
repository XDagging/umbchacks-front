import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const endpoint = "https://localhost";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Guard against duplicate fetches
  const fetched = useRef(false);

  useEffect(() => {
    async function fetchCharacters() {
      if (fetched.current) return; // stop second run in StrictMode
      fetched.current = true;

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
        setLoading(true);
        setError(null);

        const response = await fetch(`${endpoint}/api/gemini`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw response data:", data);
        console.log("Type of data:", typeof data);
        console.log("Is array:", Array.isArray(data));

        let result: any = null;

        // Try different ways to extract the characters array
        if (Array.isArray(data)) {
          result = data;
          console.log("Using data directly as array");
        } else if (data.result && Array.isArray(data.result)) {
          result = data.result;
          console.log("Using data.result as array");
        } else if (data.characters && Array.isArray(data.characters)) {
          result = data.characters;
          console.log("Using data.characters as array");
        } else if (data.response && Array.isArray(data.response)) {
          result = data.response;
          console.log("Using data.response as array");
        } else if (typeof data === "string") {
          console.log("Data is string, attempting to parse:", data);
          try {
            const cleaned = data.trim();
            result = JSON.parse(cleaned);
            console.log("Parsed string result:", result);
          } catch (e) {
            console.error("Failed to parse string result:", data, e);
            setError("Failed to parse characters from string response.");
            return;
          }
        } else if (data.result && typeof data.result === "string") {
          console.log("data.result is string, attempting to parse:", data.result);
          try {
            const cleaned = data.result.trim();
            result = JSON.parse(cleaned);
            console.log("Parsed data.result string:", result);
          } catch (e) {
            console.error("Failed to parse data.result string:", data.result, e);
            setError("Failed to parse characters from result string.");
            return;
          }
        } else {
          console.error("Unknown response structure:", data);
          console.log("Available keys:", Object.keys(data));
          setError(`Unknown response format. Keys available: ${Object.keys(data).join(", ")}`);
          return;
        }

        if (Array.isArray(result) && result.length > 0) {
          console.log("Final parsed characters:", result);
          
          // Validate the structure of characters
          const validCharacters = result.filter(char => 
            char && 
            typeof char.name === 'string' && 
            typeof char.job === 'string' && 
            Array.isArray(char.traits) && 
            typeof char.description === 'string'
          );

          if (validCharacters.length === 0) {
            console.error("No valid characters found in result:", result);
            setError("Characters data is malformed.");
            return;
          }

          setCharacters(validCharacters);
        } else {
          console.error("Result is not a valid array:", result);
          setError("Invalid response format - expected array of characters.");
        }
      } catch (err) {
        console.error("Error fetching characters:", err);
        setError(`Error fetching characters: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1a1a] p-8 rounded-lg border-2 border-gray-600 w-11/12 max-w-4xl text-white relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X size={32} />
        </button>

        {/* Title */}
        <h2 className="text-4xl mb-6 text-blue-400">Select Your Character</h2>

        {/* Loading / Error / Characters */}
        {loading ? (
          <div className="text-center">
            <p className="text-gray-400">Loading characters...</p>
            <p className="text-gray-500 text-sm mt-2">Check console for debugging info</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Check console for more details</p>
          </div>
        ) : characters.length === 0 ? (
          <p className="text-gray-400">No characters found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
            {characters.map((char, index) => {
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selected === index
                      ? "border-blue-400 bg-[#2a2a2a]"
                      : "border-gray-600 hover:border-blue-400"
                  }`}
                  onClick={() => setSelected(index)}
                >
                  <h3 className="text-2xl font-bold text-blue-400">{char.name}</h3>
                  <p className="italic mb-2">{char.job}</p>
                  <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-gray-300">
                    {char.traits.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <p className="text-gray-400 text-sm">{char.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Debug info - remove this in production */}
        <div className="mt-4 text-xs text-gray-500">
          Characters loaded: {characters.length} | Selected: {selected}
        </div>

        {/* Confirm Button */}
        {!loading && !error && characters.length > 0 && (
          <button
            onClick={() => selected !== null && onConfirm(characters[selected])}
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition mt-8 ${
              selected === null ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={selected === null}
          >
            Confirm Character
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterSelect;