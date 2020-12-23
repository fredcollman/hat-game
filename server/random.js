const READABLE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

const randomChar = () => {
  const idx = Math.floor(READABLE_CHARS.length * Math.random());
  return READABLE_CHARS.charAt(idx);
};

export const randomID = () => {
  return Array.from({ length: 6 })
    .map(() => randomChar())
    .join("");
};
