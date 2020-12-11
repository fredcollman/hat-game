const SuggestionForm = ({ addSuggestion }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    addSuggestion(e.target["suggestion"].value);
    e.target["suggestion"].value = "";
  };
  return (
    <form className="flex flex-column flex-center" onSubmit={handleSubmit}>
      <label>
        <div>Enter a famous name</div>
        <input
          required
          type="text"
          name="suggestion"
          placeholder="e.g. Britney Spears"
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default SuggestionForm;
