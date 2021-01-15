import useSocket from "./useSocket";

const useSender = (messageType) => {
  const socket = useSocket();
  const send = (data) => {
    socket.emit(messageType, data);
  };
  return send;
};

export default useSender;
