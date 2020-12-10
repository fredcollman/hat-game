const SuggestionForm = ({ addSuggestion }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    addSuggestion(e.target["suggestion"].value);
  };
  return (
    <section>
      <h2>Suggestions</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Enter a famous name
          <input
            required
            type="text"
            name="suggestion"
            placeholder="e.g. Britney Spears"
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </section>
  );
};

export default SuggestionForm;
