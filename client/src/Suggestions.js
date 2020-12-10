import SuggestionForm from "./SuggestionForm";

const Suggestions = ({ yourSuggestions, addSuggestion, count }) => {
  return (
    <section>
      <h2>Suggestions</h2>
      <SuggestionForm addSuggestion={addSuggestion} />
      <p>There are {count} names in the hat.</p> Your suggestions:
      <ul>
        {yourSuggestions.map((sugg) => (
          <li key={sugg}>{sugg}</li>
        ))}
      </ul>
    </section>
  );
};

export default Suggestions;
