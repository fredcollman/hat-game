import BasicForm from "./BasicForm";

const SuggestionForm = ({ addSuggestion }) => {
  const handleSubmit = (e) => {
    console.log(e);
    addSuggestion(e.target["suggestion"].value);
    e.target["suggestion"].value = "";
  };
  return (
    <BasicForm
      onSubmit={handleSubmit}
      labelText="Enter a famous name"
      fieldName="suggestion"
      placeholder="e.g. Britney Spears"
      buttonText="Submit"
    />
  );
};

export default SuggestionForm;
