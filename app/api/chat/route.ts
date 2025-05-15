import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: openai('gpt-4o'),
		messages,
		system: `You are a helpful assistant. Check your knowledge base before answering any questions.
			Only respond to questions using information from tool calls.
			if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
		tools: {
			addResource: tool({
				description: `add a resource to your knowledge base. 
					      If the user provides a random piece of knowledge unprompted,
					      use this tool without asking for confirmation`,
				parameters: z.object({
					content: z.string().describe('the content or resource to add to the knowledge base'),
				}),
				execute: async ({ content }) => createResource({ content })
			}),
			getInformation: tool({
				description: `get information from your knowledge base to answer questions.`,
				parameters: z.object({
					question: z.string().describe('the users question'),
				}),
				execute: async ({ question }) => findRelevantContent(question),
			}),
			weather: tool({
				description: 'Get weather in a location (farenheit)',
				parameters: z.object({
					location: z.string().describe('The location to get the weather for')
				}),
				execute: async ({ location }) => {
					const tempreature = Math.round(Math.random() * (90 - 32) + 32);
					return {
						location,
						tempreature
					}
				}
			}),
			convertFarenheitToCelcius: tool({
				description: 'Converts temperature in farenheit to celsius',
				parameters: z.object({
					temperature: z.number().describe('Tempereture in farenheit to convert')
				}),
				execute: async ({ temperature }) => {
					const celsius = Math.round((temperature - 32) * (5 / 9));
					return {
						celsius,
					};
				}
			})
		}
	});

	return result.toDataStreamResponse();
}
