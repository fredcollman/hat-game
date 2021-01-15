import useSocket from "./useSocket";

const useSender = (messageType: string) => {
  const socket = useSocket();
  const send = (data: any = null) => {
    if (socket) {
      socket.emit(messageType, data);
    }
  };
  return send;
};

export default useSender;
