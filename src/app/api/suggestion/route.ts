import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { groq } from "@ai-sdk/groq";
import { suggestion } from "@/features/editor/extensions/suggestions";
import schema from "../../../../convex/schema";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";
const suggestionSchema = z.object({
    suggestion: z.string().describe("the code to insert at cursor, or empty string if no completion needed"),
})
const SUGGESTION_PROMPT = `You are an expert AI code completion engine.

Your job is to predict ONLY the text that should be inserted exactly at the user's cursor position.

## Context

<file_name>
{fileName}
</file_name>

<line_number>
{lineNumber}
</line_number>

<previous_lines>
{previousLines}
</previous_lines>

<current_line>
{currentLine}
</current_line>

<before_cursor>
{textBeforeCursor}
</before_cursor>

<after_cursor>
{textAfterCursor}
</after_cursor>

<next_lines>
{nextLines}
</next_lines>

<full_code>
{code}
</full_code>

## Rules

Think silently before answering.

Determine whether a completion is actually needed.

Return an empty string if ANY of these are true:

- The cursor is already at the end of a complete statement.
- The following code already continues what the user is typing.
- The user has already finished the expression.
- There is not enough context to confidently predict the next code.
- Any completion would duplicate existing code.

Otherwise:

- Return ONLY the text that should be inserted.
- Never repeat code already before the cursor.
- Never repeat code already after the cursor.
- Never include markdown.
- Never wrap the answer in code fences.
- Never explain your answer.
- Preserve the existing coding style.
- Preserve indentation.
- Match the surrounding language and framework.
- Use existing variable names and functions whenever possible.
- Produce the shortest correct completion.

Examples:

Before:
const name =

Completion:
 "John";

---

Before:
if(user

Completion:
.isAdmin){

---

Before:
console.

Completion:
log()

---

Return ONLY the completion text.`;

export async function POST(request: Request) {
    try {
        const {userId} = await auth()
        if(!userId){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status:403}
            )
        }
        const {
            fileName,
            code,
            currentLine,
            previousLines,
            textBeforeCursor,
            textAfterCursor,
            nextLines,
            lineNumber
        } = await request.json()
        if (!code) {
            return NextResponse.json(
                { error: "code is required" },
                { status: 400 }
            )
        }
        const prompt = SUGGESTION_PROMPT
            .replace("{fileName}", fileName)
            .replace("{code}", code)
            .replace("{currentLine}", currentLine)
            .replace("{previousLines}", previousLines || "")
            .replace("{textBeforeCursor}", textBeforeCursor)
            .replace("{textAfterCursor}", textAfterCursor)
            .replace("{nextLines}", nextLines || "")
            .replace("{lineNumber}", lineNumber.toString());
        const {output} = await generateText({
            model: groq("openai/gpt-oss-120b"),
            output: Output.object({schema: suggestionSchema}),
            prompt,
        })
        return NextResponse.json({suggestion: output.suggestion})
    } catch(error) {
        console.error("Suggestion error: ", error);
        return NextResponse.json(
            {error: "Failed to generate suggestion"},
            {status: 500}
        )
    }
}

// 10:00:00