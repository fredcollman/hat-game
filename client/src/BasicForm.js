const BasicForm = ({
  onSubmit,
  labelText,
  fieldName,
  placeholder,
  buttonText,
}) => {
  const handleSubmit = (e) => {
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
