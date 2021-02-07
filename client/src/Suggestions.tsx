import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import SuggestionForm from "./SuggestionForm";

const YourSuggestions = ({ names }: { names: string[] }) => {
  if (!names.length) {
    return <>You haven't submitted any names yet.</>;
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

interface Props {
  count: number;
  groupID: string;
}

const ADD_SUGGESTION = gql`
  mutation AddSuggestion($groupID: String!, $suggestion: String!) {
    addSuggestion(groupID: $groupID, suggestion: $suggestion) {
      suggestions {
        count
        yours
      }
    }
  }
`;

const Suggestions = ({ count, groupID }: Props) => {
  const [addSuggestion] = useMutation(ADD_SUGGESTION);
  const [yourSuggestions, setYourSuggestions] = useState<string[]>([]);
  const countText = count === 1
    ? "There is 1 name"
    : `There are ${count} names`;
  const doAddSuggestion = (name: string) => {
    if (name && name.length) {
      setYourSuggestions((prev) => {
        if (prev.includes(name)) {
          return prev;
        }
        addSuggestion({ variables: { groupID, suggestion: name } });
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
