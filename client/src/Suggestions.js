import SuggestionForm from "./SuggestionForm";

const YourSuggestions = ({ names }) => {
  if (!names.length) {
    return "You haven't submitted any names yet.";
  }
  return (
    <>
      Your suggestions:
      <ul className="flex gap-m">
        {names.map((name) => (
          <li key={name} className="padding-m bg-light">
            {name}
          </li>
        ))}
      </ul>
    </>
  );
};

const Suggestions = ({ yourSuggestions, addSuggestion, count }) => {
  const countText = count === 1
    ? "There is 1 name"
    : `There are ${count} names`;
  return (
    <section className="stack-m">
      <h2>Suggestions</h2>
      <SuggestionForm addSuggestion={addSuggestion} />
      <div>
        {`${countText} in the hat. `}
        <YourSuggestions names={yourSuggestions} />
      </div>
    </section>
  );
};

export default Suggestions;
