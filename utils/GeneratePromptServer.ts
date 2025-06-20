import type { OllamaResponse, OllamaPromptResponse } from '~/types/Ollama';
import chalk from 'chalk';

export async function generatePrompt(image: string, prompt?: string, retries: number = 3): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200000);

    let result: OllamaResponse<OllamaPromptResponse> = await (await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
            model: process.env.PROMPT_MODEL || 'gemma3:12b',
            messages: [
                {
                    role: 'system',
                    content: "Your job is to describe the image in detail. Describe where elements are and how they are shaped. It will be used to describe a website. Only include the description of the image. Don't aknowledge this message in your text. Because the image shows one screen, the website should fill the entire screen like in the image. Specify this in your description when describing the elements. If you describe a grid, label the axis, for example 2x1 means two collumns and one row. Describe all elements in the image. Include the form of the elements. Start your text with 'Code a website that...",
                },
                {
                    role: 'user',
                    content: prompt ?? "Here is my image. Describe it in detail.",
                    images: [
                        image
                    ]
                }
            ],
            stream: false,
            temperature: 0.5
        }),
    })).json();

    clearTimeout(timeout);

    if(result == undefined || result.message == undefined || result.message.content == undefined) {
        if(retries <= 0) {
            console.log(result);
            console.log(result.message);
            console.log(result.message.content);
            throw new Error('Failed to generate prompt from image');
        }
        console.log(chalk.yellow('Failed to generate prompt from image. Trying again...'));
        return generatePrompt(image, prompt, retries - 1);
    }

    return result.message.content;
}