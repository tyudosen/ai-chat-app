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
		tools: {
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
			})
		}
	});

	return result.toDataStreamResponse();
}
