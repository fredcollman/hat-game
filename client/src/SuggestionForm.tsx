import { FormEvent } from "react";
import BasicForm from "./BasicForm";

interface Props {
  addSuggestion: (suggestion: string) => void;
}

const SuggestionForm = ({ addSuggestion }: Props) => {
  const handleSubmit = (e: FormEvent) => {
    console.log(e);
    const form = e.target as HTMLFormElement;
    addSuggestion(form["suggestion"].value);
    form["suggestion"].value = "";
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
