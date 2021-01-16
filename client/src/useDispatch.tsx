import { createContext, Dispatch, FC, useContext } from "react";
import { Message } from "./utils";

const DispatchContext = createContext<Dispatch<Message> | null>(null);

const useDispatch = () => useContext(DispatchContext);

interface Props {
  dispatch: Dispatch<Message>;
}

export const DispatchProvider: FC<Props> = ({ dispatch, children }) => {
  return (
    <DispatchContext.Provider value={dispatch}>
      {children}
    </DispatchContext.Provider>
  );
};

export default useDispatch;
