import formatTodosForAI from "./formatTodosForAI";

const fetchSuggestion = async (board: Board) => {
  const todos = formatTodosForAI(board);
  console.log('Formatted todos to send to gpt >>> ', todos);

  const res = await fetch("/api/generateSummary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({todos}),
  });

  const GPTdata = await res.json();

  return GPTdata
}

export default fetchSuggestion;