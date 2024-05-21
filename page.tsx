/** The page contains two components, the header(including the GPT-4 text generation) and the board */

import Board from "@/components/Board";
import Header from "@/components/Header";
/** @ in the import path means the top level  */


export default function Home() {
  return (
    <main>
      {/* Header */}
      <Header />
      
      
      {/* Board */}
      <Board />
      
    </main>
  );
}
