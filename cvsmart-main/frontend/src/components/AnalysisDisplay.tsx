import React from "react";
// Optional: Import icons if you want to use them (e.g., from react-icons)
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaCalculator,
  FaKey,
  FaPen,
  FaClipboardList,
  FaUserTie,
  FaBullseye,
  FaChartLine,
} from "react-icons/fa";

// Helper type for structure (optional, but good practice)
type AnalysisSection = {
  key: string;
  element: JSX.Element;
};

const AnalysisDisplay = ({ analysis }: { analysis: string | null }) => {
  // Handle loading or empty state
  if (!analysis) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 md:p-8 font-sans max-w-4xl mx-auto my-8 border border-gray-200 text-center text-gray-500">
        Generating analysis... Please wait.
      </div>
    );
  }

  const renderAnalysis = (): JSX.Element[] => {
    const lines = analysis.trim().split("\n");
    const sections: AnalysisSection[] = [];
    let currentListItems: JSX.Element[] = [];

    const flushList = () => {
      if (currentListItems.length > 0) {
        sections.push({
          key: `ul-${sections.length}`,
          element: (
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              {currentListItems}
            </ul>
          ),
        });
        currentListItems = [];
      }
    };

    const cleanText = (text: string) =>
      text
        .replace(/^\*\s*/, "") // Remove leading asterisks
        .replace(/\*\*/g, "") // Remove double asterisks
        .replace(/\b(bullet points|max 3-6|keep concise)\b.*$/i, "") // Remove internal AI instructions
        .trim();

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // --- Score Display ---
      const scoreMatch = trimmedLine.match(
        /^1\.\s*\*\*Overall Match Score:\*\*\s*([\d.%]+)/i
      );
      if (scoreMatch) {
        flushList();
        const score = scoreMatch[1];
        sections.push({
          key: `score-${index}`,
          element: (
            <div className="mb-8 text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-indigo-200 shadow-sm">
              <h2 className="text-sm font-semibold text-indigo-700 uppercase tracking-widest mb-1">
                Overall Match Score
              </h2>
              <p className="text-6xl font-bold text-indigo-600">{score}</p>
            </div>
          ),
        });
        return;
      }

      // --- Main Heading (H2) ---
      const topHeading = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*\s*:(.*)/);
      if (topHeading) {
        flushList();
        const heading = cleanText(topHeading[2]);
        const rest = cleanText(topHeading[3]);

        sections.push({
          key: `h2-${index}`,
          element: (
            <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4 border-b border-gray-200 pb-2">
              {heading}
            </h2>
          ),
        });

        if (rest) {
          sections.push({
            key: `h2-p-${index}`,
            element: <p className="text-gray-700 mb-4">{rest}</p>,
          });
        }
        return;
      }

      // --- Subheading (H3) ---
      const subHeadingMatch = trimmedLine.match(
        /^\s*\*\*\s*(.*?)\s*\*\*:\s*(.*)/
      );
      if (subHeadingMatch) {
        flushList();
        const subTitle = cleanText(subHeadingMatch[1]);
        const content = cleanText(subHeadingMatch[2]);

        sections.push({
          key: `h3-${index}`,
          element: (
            <h3 className="text-lg font-bold text-gray-700 mt-6 mb-2">
              {subTitle}
            </h3>
          ),
        });

        if (content) {
          sections.push({
            key: `h3-p-${index}`,
            element: <p className="text-gray-600 mb-4">{content}</p>,
          });
        }
        return;
      }

      // --- Bullet List ---
      const bulletMatch = trimmedLine.match(/^\*\s+(.*)/);
      if (bulletMatch) {
        currentListItems.push(
          <li key={`li-${index}`} className="leading-relaxed text-gray-700">
            {cleanText(bulletMatch[1])}
          </li>
        );
        return;
      }

      // --- Default Paragraph ---
      flushList();
      sections.push({
        key: `p-${index}`,
        element: <p className="text-gray-700 mb-4">{cleanText(trimmedLine)}</p>,
      });
    });

    flushList();
    return sections.map((section) => section.element);
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-10 font-sans max-w-4xl mx-auto my-8 border border-gray-200">
      {renderAnalysis()}
    </div>
  );
};

export default AnalysisDisplay;
