// This is only for demo purposes for https://jazz.tools
// This is NOT needed to make the chat work

export const inIframe = window.self !== window.top;

const animals = [
  "elephant",
  "penguin",
  "giraffe",
  "octopus",
  "kangaroo",
  "dolphin",
  "cheetah",
  "koala",
  "platypus",
  "pangolin",
];

export function getRandomUsername() {
  return `Anonymous ${animals[Math.floor(Math.random() * animals.length)]}`;
}
