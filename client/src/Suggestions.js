import { useState } from "react";
import SuggestionForm from "./SuggestionForm";

const YourSuggestions = ({ names }) => {
  if (!names.length) {
    return "You haven't submitted any names yet.";
  }
  return (
    <>
      Your suggestions:
      <ul className="flex flex-wrap gap-m">
        {names.map((name) => (
          <li key={name} className="paper padding-m">
            {name}
          </li>
        ))}
      </ul>
    </>
  );
};

const Suggestions = ({ addSuggestion, count }) => {
  const [yourSuggestions, setYourSuggestions] = useState([]);
  const countText = count === 1
    ? "There is 1 name"
    : `There are ${count} names`;
  const doAddSuggestion = (name) => {
    if (name && name.length) {
      setYourSuggestions((prev) => {
        if (prev.includes(name)) {
          return prev;
        }
        addSuggestion(name);
        return [...prev, name];
      });
    }
  };
  return (
    <section className="stack-m">
      <h2>Suggestions</h2>
      <SuggestionForm addSuggestion={doAddSuggestion} />
      <div className="stack-m">
        <h3>Suggested so far</h3>
        <div>{`${countText} in the hat. `}</div>
        <YourSuggestions names={yourSuggestions} />
      </div>
    </section>
  );
};

export default Suggestions;
