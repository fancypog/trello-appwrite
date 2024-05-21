import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // todos in the body of the POST request
  const {todos} = await request.json();
  console.log(todos);

  // communicate with GPT-4
  const response = await openai.chat.completions.create({
    model:"gpt-4o",
    messages: [
      {
        role: "system",
        content: `When responding, welcome the user as Miss Frances and say welcome to the Trello App! Limit the response to 200 characters`, 
      },
      {
        role: "user",
        content: `Hi there, provide a summary of the following todos. Count how many todos are in each category such as To do, in progress and done, then say something nice to encourge the user then tell the user to have a productive day! Here's the data: ${JSON.stringify(todos)}`,
      }
    ],
  });


  // Destructure the data from the response
  // Console log the response from gpt
  console.log("Response from gpt is: ", response.choices[0])
  console.log(response.choices[0].message.content);

  return NextResponse.json(response.choices[0].message.content);
}