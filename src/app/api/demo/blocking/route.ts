import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST() {
    const response = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: 'what is meant by karim benzema 15'
    })
    return Response.json(response)
}