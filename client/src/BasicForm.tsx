import { FormEvent } from "react";

interface Props {
  onSubmit: (e: FormEvent) => void;
  labelText: string;
  fieldName: string;
  placeholder: string;
  buttonText: string;
}

const BasicForm = ({
  onSubmit,
  labelText,
  fieldName,
  placeholder,
  buttonText,
}: Props) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };
  return (
    <form
      className="flex flex-column flex-center center-text"
      onSubmit={handleSubmit}
    >
      <label>
        <div>{labelText}</div>
        <input
          required
          type="text"
          name={fieldName}
          placeholder={placeholder}
        />
      </label>
      <button type="submit">{buttonText}</button>
    </form>
  );
};

export default BasicForm;
