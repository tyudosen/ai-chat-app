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
