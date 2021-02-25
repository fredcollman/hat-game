import { useReducer } from "react";
import Layout from "./Layout";
import CurrentPhase from "./CurrentPhase";
import reducer, { initialize } from "./reducer";
import { DispatchProvider } from "./useDispatch";

const useDispatcher = () => {
  const [state, dispatch] = useReducer(reducer, initialize());
  return { state, dispatch };
};

const Main = () => {
  const { state, dispatch } = useDispatcher();
  return (
    <Layout>
      <DispatchProvider dispatch={dispatch}>
        <CurrentPhase state={state} />
      </DispatchProvider>
    </Layout>
  );
};

export default Main;
