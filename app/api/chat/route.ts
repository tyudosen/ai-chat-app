import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool, type Message } from 'ai';
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages }: { messages: Message[] } = await req.json();


	const messageHavePDF = messages.some(message => message.experimental_attachments?.some(attachement => attachement.contentType === 'application/pdf'))

	const result = streamText({
		model: messageHavePDF ? anthropic('claude-3-5-sonnet-latest') : openai('gpt-4o'),
		messages,
		system: `You are an helpful and polite assitant. You will answer questions from your knowledge base.
			If you do not have enough context to answer ask for more. You can store relevant information 
			in your knowledge base with addResource and you can fetch info to answer questions using getInformation. Always save 
			new information relevant to the user`,
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
				description: `get information from your knowledge base to answer questions.
						search before answering questions.`,
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
